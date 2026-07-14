import { Module } from '@nestjs/common';
import { MerciService } from './merci.service';
import {
  MerciQuestionsController,
  MerciCoachController,
  MeMerciController,
} from './merci.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlayerAuthModule } from '../player-auth/player-auth.module';

@Module({
  imports: [PrismaModule, AuthModule, PlayerAuthModule],
  controllers: [MerciQuestionsController, MerciCoachController, MeMerciController],
  providers: [MerciService],
})
export class MerciModule {}
