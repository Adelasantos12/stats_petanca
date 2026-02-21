import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThrowDto } from './dto/create-throw.dto';
import { UpdateThrowDto } from './dto/update-throw.dto';

@Injectable()
export class ThrowsService {
  constructor(private prisma: PrismaService) {}

  async create(matchId: string, createThrowDto: CreateThrowDto) {
    return this.prisma.throw.create({
      data: {
        matchId,
        ...createThrowDto,
      },
    });
  }

  async update(id: string, updateThrowDto: UpdateThrowDto) {
    return this.prisma.throw.update({
      where: { id },
      data: updateThrowDto,
    });
  }

  async remove(id: string) {
    return this.prisma.throw.delete({
      where: { id },
    });
  }
}
