import { Controller, Patch, Delete, Param, Body } from '@nestjs/common';
import { ThrowsService } from './throws.service';
import { UpdateThrowDto } from './dto/update-throw.dto';

@Controller('throws')
export class ThrowsController {
  constructor(private readonly throwsService: ThrowsService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThrowDto: UpdateThrowDto) {
    return this.throwsService.update(id, updateThrowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.throwsService.remove(id);
  }
}
