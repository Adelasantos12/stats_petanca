import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MatchesModule } from './matches/matches.module';
import { ThrowsModule } from './throws/throws.module';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PlayersModule,
    MatchesModule,
    ThrowsModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
