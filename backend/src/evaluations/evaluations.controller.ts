import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';

@Controller('players')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluations: EvaluationsService) {}

  @Get(':id/next-level')
  nextLevel(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.evaluations.nextLevel(id, coach);
  }

  @Get(':id/evaluations')
  history(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.evaluations.findForPlayer(id, coach);
  }

  @Post(':id/evaluations')
  create(
    @Param('id') id: string,
    @Body() dto: CreateEvaluationDto,
    @CurrentCoach() coach: AuthCoach,
  ) {
    return this.evaluations.create(id, coach, dto);
  }
}
