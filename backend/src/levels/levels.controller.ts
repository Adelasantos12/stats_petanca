import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('levels')
@UseGuards(JwtAuthGuard)
export class LevelsController {
  constructor(private readonly levels: LevelsService) {}

  @Get()
  findAll() {
    return this.levels.findAll();
  }

  @Post(':id/criteria')
  addCriterion(@Param('id') id: string, @Body() dto: CreateCriterionDto) {
    return this.levels.addCriterion(id, dto);
  }

  @Delete('criteria/:id')
  removeCriterion(@Param('id') id: string) {
    return this.levels.removeCriterion(id);
  }
}
