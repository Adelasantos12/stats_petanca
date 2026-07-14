import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthPlayer {
  id: string;
  email: string | null;
  name: string;
}

/** Extrae el jugador autenticado (inyectado por PlayerAuthGuard en request.player). */
export const CurrentPlayer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthPlayer => {
    return ctx.switchToHttp().getRequest().player;
  },
);
