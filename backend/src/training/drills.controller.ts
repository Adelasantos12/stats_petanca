import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateDrillDto } from './dto/create-drill.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';

@Controller('drills')
@UseGuards(JwtAuthGuard)
export class DrillsController {
  constructor(private readonly training: TrainingService) {}

  @Get()
  list() {
    return this.training.listDrills();
  }

  @Post()
  add(@Body() dto: CreateDrillDto, @CurrentCoach() coach: AuthCoach) {
    return this.training.addDrill(dto, coach);
  }
}
