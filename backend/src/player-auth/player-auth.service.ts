import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  PlayerRegisterDto,
  PlayerLoginDto,
} from './dto/player-auth.dto';

interface PlayerRow {
  id: string;
  name: string;
  email: string | null;
  level: string | null;
  category: string | null;
}

@Injectable()
export class PlayerAuthService {
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

  private sign(player: PlayerRow) {
    const token = this.jwt.sign({
      sub: player.id,
      kind: 'PLAYER',
      email: player.email,
      name: player.name,
    });
    return {
      token,
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        level: player.level,
        category: player.category,
      },
    };
  }

  /**
   * Alta / reclamo de cuenta del jugador.
   * - Si el coach ya lo tenía en el roster con ese email y sin contraseña,
   *   "reclama" esa ficha (conserva su historial).
   * - Si no existe, crea un jugador nuevo (sin coach).
   */
  async register(dto: PlayerRegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const claimable = await this.prisma.player.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, password: null },
    });

    if (claimable) {
      const password = await bcrypt.hash(dto.password, 10);
      const player = await this.prisma.player.update({
        where: { id: claimable.id },
        data: {
          password,
          provider: 'password',
          name: dto.name?.trim() || claimable.name,
        },
      });
      return this.sign(player);
    }

    const already = await this.prisma.player.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, NOT: { password: null } },
    });
    if (already) {
      throw new ConflictException(
        'Ya existe una cuenta con ese email. Inicia sesión.',
      );
    }

    const password = await bcrypt.hash(dto.password, 10);
    const player = await this.prisma.player.create({
      data: {
        name: dto.name?.trim() || email.split('@')[0],
        email,
        password,
        provider: 'password',
      },
    });
    return this.sign(player);
  }

  async login(dto: PlayerLoginDto) {
    const email = dto.email.trim().toLowerCase();
    const player = await this.prisma.player.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, NOT: { password: null } },
    });
    if (!player || !player.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const ok = await bcrypt.compare(dto.password, player.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    return this.sign(player);
  }

  async google(credential: string) {
    if (!this.googleClient || !this.googleClientId) {
      throw new ServiceUnavailableException(
        'El login con Google no está configurado',
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

    let player = await this.prisma.player.findFirst({
      where: {
        OR: [{ googleId }, { email: { equals: email, mode: 'insensitive' } }],
      },
    });

    if (player) {
      player = await this.prisma.player.update({
        where: { id: player.id },
        data: { googleId: player.googleId ?? googleId, provider: player.provider === 'none' ? 'google' : player.provider },
      });
    } else {
      player = await this.prisma.player.create({
        data: { name, email, googleId, provider: 'google' },
      });
    }
    return this.sign(player);
  }

  async me(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, level: true, category: true },
    });
    if (!player) throw new UnauthorizedException();
    return player;
  }
}
