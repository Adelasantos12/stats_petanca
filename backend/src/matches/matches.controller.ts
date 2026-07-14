import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { CloseHandDto } from './dto/close-hand.dto';
import { FinishMatchDto } from './dto/finish-match.dto';
import { CreateThrowDto } from '../throws/dto/create-throw.dto';
import { ThrowsService } from '../throws/throws.service';
import type { AuthCoach } from '../auth/current-coach.decorator';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    private readonly throwsService: ThrowsService,
    private readonly jwt: JwtService,
  ) {}

  @Post()
  async create(@Body() createMatchDto: CreateMatchDto, @Req() req: any) {
    const coach = await this.optionalCoach(req.headers?.authorization);
    return this.matchesService.create(createMatchDto, coach);
  }

  /** Lee el coach del Bearer token si viene; la creación de partida sigue siendo pública. */
  private async optionalCoach(
    header?: string,
  ): Promise<AuthCoach | undefined> {
    if (!header?.startsWith('Bearer ')) return undefined;
    try {
      const payload = await this.jwt.verifyAsync(
        header.slice('Bearer '.length).trim(),
      );
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
    } catch {
      return undefined;
    }
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
