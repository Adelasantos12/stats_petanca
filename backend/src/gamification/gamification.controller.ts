import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';
import { PlayerAuthGuard } from '../player-auth/player-auth.guard';
import { CurrentPlayer } from '../player-auth/current-player.decorator';
import type { AuthPlayer } from '../player-auth/current-player.decorator';

@Controller('player-auth/me')
@UseGuards(PlayerAuthGuard)
export class MeGamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('gamification')
  mine(@CurrentPlayer() player: AuthPlayer) {
    return this.gamification.forPlayer(player.id);
  }
}

@Controller('players')
@UseGuards(JwtAuthGuard)
export class CoachGamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get(':id/gamification')
  forPlayer(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.gamification.forPlayerByCoach(id, coach);
  }
}
