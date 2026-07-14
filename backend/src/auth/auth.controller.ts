import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleDto } from './dto/google.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentCoach } from './current-coach.decorator';
import type { AuthCoach } from './current-coach.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Alta de coach. Pública solo para el primer coach (bootstrap = SUPER_ADMIN).
   * Después requiere un token de SUPER_ADMIN, que se lee de forma opcional aquí.
   */
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    const requester = await this.optionalCoach(req.headers?.authorization);
    return this.auth.register(dto, requester);
  }

  private async optionalCoach(
    header?: string,
  ): Promise<AuthCoach | undefined> {
    if (!header?.startsWith('Bearer ')) return undefined;
    try {
      const payload = await this.jwt.verifyAsync(
        header.slice('Bearer '.length).trim(),
      );
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
    } catch {
      return undefined;
    }
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('google')
  google(@Body() dto: GoogleDto) {
    return this.auth.google(dto.credential);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentCoach() coach: AuthCoach) {
    return this.auth.me(coach.id);
  }

  @Get('status')
  status() {
    return this.auth.needsBootstrap();
  }
}
