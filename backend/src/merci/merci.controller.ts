import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MerciService } from './merci.service';
import { CreateMerciDto } from './dto/create-merci.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';
import { PlayerAuthGuard } from '../player-auth/player-auth.guard';
import { CurrentPlayer } from '../player-auth/current-player.decorator';
import type { AuthPlayer } from '../player-auth/current-player.decorator';

@Controller('merci')
@UseGuards(JwtAuthGuard)
export class MerciQuestionsController {
  constructor(private readonly merci: MerciService) {}

  @Get('questions')
  questions() {
    return this.merci.getQuestions();
  }
}

@Controller('players')
@UseGuards(JwtAuthGuard)
export class MerciCoachController {
  constructor(private readonly merci: MerciService) {}

  @Post(':id/merci')
  create(
    @Param('id') id: string,
    @Body() dto: CreateMerciDto,
    @CurrentCoach() coach: AuthCoach,
  ) {
    return this.merci.create(id, coach, dto);
  }

  @Get(':id/merci')
  history(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.merci.historyForPlayer(id, coach);
  }
}

@Controller('player-auth/me')
@UseGuards(PlayerAuthGuard)
export class MeMerciController {
  constructor(private readonly merci: MerciService) {}

  @Get('merci')
  mine(@CurrentPlayer() player: AuthPlayer) {
    return this.merci.historyForSelf(player.id);
  }
}
