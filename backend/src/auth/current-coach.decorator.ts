import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthCoach {
  id: string;
  email: string;
  role: 'COACH' | 'SUPER_ADMIN';
  name: string;
}

/**
 * Extrae el coach autenticado (inyectado por JwtAuthGuard en request.coach).
 */
export const CurrentCoach = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthCoach => {
    const request = ctx.switchToHttp().getRequest();
    return request.coach;
  },
);
