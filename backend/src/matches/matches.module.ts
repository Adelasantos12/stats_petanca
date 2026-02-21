import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { ThrowsModule } from '../throws/throws.module';

@Module({
  imports: [ThrowsModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
