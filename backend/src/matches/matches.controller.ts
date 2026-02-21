import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { CloseHandDto } from './dto/close-hand.dto';
import { FinishMatchDto } from './dto/finish-match.dto';
import { CreateThrowDto } from '../throws/dto/create-throw.dto';
import { ThrowsService } from '../throws/throws.service';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly throwsService: ThrowsService,
  ) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post(':id/hands/close')
  closeHand(@Param('id') id: string, @Body() closeHandDto: CloseHandDto) {
    return this.matchesService.closeHand(id, closeHandDto);
  }

  @Post(':id/hands/cancel')
  cancelHand(@Param('id') id: string) {
    return this.matchesService.cancelHand(id);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string, @Body() finishMatchDto: FinishMatchDto) {
    return this.matchesService.finish(id, finishMatchDto);
  }

  @Get(':id/performance')
  getPerformance(@Param('id') id: string) {
    return this.matchesService.getPerformance(id);
  }

  @Post(':id/throws')
  createThrow(@Param('id') id: string, @Body() createThrowDto: CreateThrowDto) {
    return this.throwsService.create(id, createThrowDto);
  }
}
