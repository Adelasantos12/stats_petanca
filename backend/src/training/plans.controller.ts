import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';

// Endpoints del coach para asignar planes y ver el entrenamiento del jugador.
@Controller('players')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly training: TrainingService) {}

  @Post(':id/plans')
  create(
    @Param('id') id: string,
    @Body() dto: CreatePlanDto,
    @CurrentCoach() coach: AuthCoach,
  ) {
    return this.training.createPlan(id, coach, dto);
  }

  @Get(':id/plans')
  plans(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.training.plansForPlayer(id, coach);
  }

  @Get(':id/sessions')
  sessions(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.training.sessionsForPlayer(id, coach);
  }
}
