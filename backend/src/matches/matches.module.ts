import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { ThrowsModule } from '../throws/throws.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ThrowsModule, AuthModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
