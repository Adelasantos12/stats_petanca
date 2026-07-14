import {
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthCoach } from './current-coach.decorator';

@Injectable()
export class AuthService {
  private readonly googleClient?: OAuth2Client;
  private readonly googleClientId?: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (this.googleClientId) {
      this.googleClient = new OAuth2Client(this.googleClientId);
    }
  }

  private sign(coach: {
    id: string;
    email: string;
    role: string;
    name: string;
  }) {
    const token = this.jwt.sign({
      sub: coach.id,
      kind: 'COACH',
      email: coach.email,
      role: coach.role,
      name: coach.name,
    });
    return {
      token,
      coach: {
        id: coach.id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
      },
    };
  }

  /**
   * Alta de coach.
   * - Si aún no existe ningún coach, el primero se crea como SUPER_ADMIN
   *   (arranque del sistema) y el endpoint es público.
   * - Si ya existen coaches, solo un SUPER_ADMIN puede dar de alta a otros,
   *   y decide su rol.
   */
  async register(dto: RegisterDto, requester?: AuthCoach) {
    const coachCount = await this.prisma.coach.count();
    const isBootstrap = coachCount === 0;

    if (!isBootstrap && requester?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo un super administrador puede crear nuevos coaches',
      );
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.coach.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Ya existe un coach con ese email');
    }

    const role = isBootstrap ? 'SUPER_ADMIN' : dto.role ?? 'COACH';
    const password = await bcrypt.hash(dto.password, 10);

    const coach = await this.prisma.coach.create({
      data: { name: dto.name.trim(), email, password, role },
    });

    return this.sign(coach);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const coach = await this.prisma.coach.findUnique({ where: { email } });
    if (!coach) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!coach.password) {
      throw new UnauthorizedException(
        'Esta cuenta usa inicio de sesión con Google',
      );
    }

    const ok = await bcrypt.compare(dto.password, coach.password);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.sign(coach);
  }

  /**
   * Login/alta con Google. Verifica el ID token, y busca-o-crea el coach por
   * email verificado. Igual que en el alta clásica, el primer coach del sistema
   * se convierte en SUPER_ADMIN.
   */
  async google(credential: string) {
    if (!this.googleClient || !this.googleClientId) {
      throw new ServiceUnavailableException(
        'El login con Google no está configurado (falta GOOGLE_CLIENT_ID)',
      );
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Token de Google inválido');
    }

    if (!payload?.email || !payload.email_verified) {
      throw new UnauthorizedException('La cuenta de Google no tiene email verificado');
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture ?? null;

    let coach = await this.prisma.coach.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (coach) {
      // Vincula la cuenta de Google si el coach existía por email/contraseña.
      coach = await this.prisma.coach.update({
        where: { id: coach.id },
        data: {
          googleId: coach.googleId ?? googleId,
          avatarUrl: coach.avatarUrl ?? avatarUrl,
        },
      });
    } else {
      const coachCount = await this.prisma.coach.count();
      const role = coachCount === 0 ? 'SUPER_ADMIN' : 'COACH';
      coach = await this.prisma.coach.create({
        data: { name, email, googleId, avatarUrl, provider: 'google', role },
      });
    }

    return this.sign(coach);
  }

  async me(id: string) {
    const coach = await this.prisma.coach.findUnique({ where: { id } });
    if (!coach) {
      throw new UnauthorizedException();
    }
    return {
      id: coach.id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
    };
  }

  /** Estado público para el frontend: alta inicial y disponibilidad de Google. */
  async needsBootstrap() {
    const count = await this.prisma.coach.count();
    return {
      needsBootstrap: count === 0,
      googleEnabled: Boolean(this.googleClientId),
    };
  }
}
