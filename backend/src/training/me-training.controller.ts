import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { LogSessionDto } from './dto/log-session.dto';
import { PlayerAuthGuard } from '../player-auth/player-auth.guard';
import { CurrentPlayer } from '../player-auth/current-player.decorator';
import type { AuthPlayer } from '../player-auth/current-player.decorator';

// Vista y registro del propio jugador (autónomo).
@Controller('player-auth/me')
@UseGuards(PlayerAuthGuard)
export class MeTrainingController {
  constructor(private readonly training: TrainingService) {}

  @Get('plan')
  plan(@CurrentPlayer() player: AuthPlayer) {
    return this.training.activePlanForSelf(player.id);
  }

  @Post('sessions')
  log(@CurrentPlayer() player: AuthPlayer, @Body() dto: LogSessionDto) {
    return this.training.logSession(player.id, dto);
  }

  @Get('sessions')
  sessions(@CurrentPlayer() player: AuthPlayer) {
    return this.training.sessionsForSelf(player.id);
  }
}
