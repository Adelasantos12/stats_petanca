import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/** Verifica el JWT y exige que sea un token de jugador (kind === 'PLAYER'). */
@Injectable()
export class PlayerAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers?.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }
    try {
      const payload = await this.jwt.verifyAsync(
        header.slice('Bearer '.length).trim(),
      );
      if (payload.kind !== 'PLAYER') {
        throw new UnauthorizedException('Se requiere una cuenta de jugador');
      }
      request.player = {
        id: payload.sub,
        email: payload.email ?? null,
        name: payload.name,
      };
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
