import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PlayerAuthService } from './player-auth.service';
import {
  PlayerRegisterDto,
  PlayerLoginDto,
  PlayerGoogleDto,
} from './dto/player-auth.dto';
import { PlayerAuthGuard } from './player-auth.guard';
import { CurrentPlayer } from './current-player.decorator';
import type { AuthPlayer } from './current-player.decorator';
import { PlayersService } from '../players/players.service';
import { EvaluationsService } from '../evaluations/evaluations.service';

@Controller('player-auth')
export class PlayerAuthController {
  constructor(
    private readonly auth: PlayerAuthService,
    private readonly players: PlayersService,
    private readonly evaluations: EvaluationsService,
  ) {}

  @Post('register')
  register(@Body() dto: PlayerRegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: PlayerLoginDto) {
    return this.auth.login(dto);
  }

  @Post('google')
  google(@Body() dto: PlayerGoogleDto) {
    return this.auth.google(dto.credential);
  }

  // ---- Vista propia del jugador (solo lectura de lo suyo) ----

  @Get('me')
  @UseGuards(PlayerAuthGuard)
  me(@CurrentPlayer() player: AuthPlayer) {
    return this.auth.me(player.id);
  }

  @Get('me/development')
  @UseGuards(PlayerAuthGuard)
  development(@CurrentPlayer() player: AuthPlayer) {
    return this.players.getDevelopmentForSelf(player.id);
  }

  @Get('me/next-level')
  @UseGuards(PlayerAuthGuard)
  nextLevel(@CurrentPlayer() player: AuthPlayer) {
    return this.evaluations.nextLevelForSelf(player.id);
  }

  @Get('me/evaluations')
  @UseGuards(PlayerAuthGuard)
  evaluations_(@CurrentPlayer() player: AuthPlayer) {
    return this.evaluations.findForPlayerSelf(player.id);
  }
}
