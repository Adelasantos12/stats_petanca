import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentCoach } from '../auth/current-coach.decorator';
import type { AuthCoach } from '../auth/current-coach.decorator';

@Controller('players')
@UseGuards(JwtAuthGuard)
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Get()
  findAll(@CurrentCoach() coach: AuthCoach) {
    return this.players.findAll(coach);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.players.findOne(id, coach);
  }

  @Post()
  create(@Body() dto: CreatePlayerDto, @CurrentCoach() coach: AuthCoach) {
    return this.players.create(dto, coach);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerDto,
    @CurrentCoach() coach: AuthCoach,
  ) {
    return this.players.update(id, dto, coach);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCoach() coach: AuthCoach) {
    return this.players.remove(id, coach);
  }
}
