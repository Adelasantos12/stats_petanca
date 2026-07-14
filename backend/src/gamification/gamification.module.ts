import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import {
  MeGamificationController,
  CoachGamificationController,
} from './gamification.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlayerAuthModule } from '../player-auth/player-auth.module';

@Module({
  imports: [PrismaModule, AuthModule, PlayerAuthModule],
  controllers: [MeGamificationController, CoachGamificationController],
  providers: [GamificationService],
})
export class GamificationModule {}
