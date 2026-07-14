import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Guard mínimo basado en Bearer token. Verifica el JWT y adjunta el coach
 * autenticado a request.coach para el resto de la petición.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers?.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }

    const token = header.slice('Bearer '.length).trim();

    try {
      const payload = await this.jwt.verifyAsync(token);
      request.coach = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
