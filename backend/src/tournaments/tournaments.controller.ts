import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { AddEntryDto } from './dto/add-entry.dto';
import { RecordResultDto } from './dto/record-result.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentsController {
  constructor(private readonly tournaments: TournamentsService) {}

  @Get()
  list(@CurrentCoach() coach: AuthCoach) {
    return this.tournaments.listMine(coach);
  }

  @Post()
  create(@Body() dto: CreateTournamentDto, @CurrentCoach() coach: AuthCoach) {
    return this.tournaments.create(dto, coach);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.tournaments.getOne(id);
  }

  @Post(':id/entries')
  addEntry(
    @Param('id') id: string,
    @Body() dto: AddEntryDto,
    @CurrentCoach() coach: AuthCoach,
  ) {
    return this.tournaments.addEntry(id, dto, coach);
  }

  @Delete('entries/:entryId')
  removeEntry(@Param('entryId') entryId: string, @CurrentCoach() coach: AuthCoach) {
    return this.tournaments.removeEntry(entryId, coach);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.tournaments.start(id, coach);
  }

  @Post('pairings/:pairingId/result')
  recordResult(
    @Param('pairingId') pairingId: string,
    @Body() dto: RecordResultDto,
    @CurrentCoach() coach: AuthCoach,
  ) {
    return this.tournaments.recordResult(pairingId, dto, coach);
  }
}
