import { Module } from '@nestjs/common';
import { PlayerAuthService } from './player-auth.service';
import { PlayerAuthController } from './player-auth.controller';
import { PlayerAuthGuard } from './player-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PlayersModule } from '../players/players.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';

@Module({
  imports: [PrismaModule, AuthModule, PlayersModule, EvaluationsModule],
  controllers: [PlayerAuthController],
  providers: [PlayerAuthService, PlayerAuthGuard],
  exports: [PlayerAuthGuard],
})
export class PlayerAuthModule {}
