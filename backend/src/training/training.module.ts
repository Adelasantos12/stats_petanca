import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { DrillsController } from './drills.controller';
import { PlansController } from './plans.controller';
import { MeTrainingController } from './me-training.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlayerAuthModule } from '../player-auth/player-auth.module';

@Module({
  imports: [PrismaModule, AuthModule, PlayerAuthModule],
  controllers: [DrillsController, PlansController, MeTrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
