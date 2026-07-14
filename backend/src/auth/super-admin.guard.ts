import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Debe usarse DESPUÉS de JwtAuthGuard. Solo deja pasar a un SUPER_ADMIN.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.coach?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Requiere rol de super administrador');
    }
    return true;
  }
}
