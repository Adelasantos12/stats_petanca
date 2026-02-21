import { Module } from '@nestjs/common';
import { ThrowsService } from './throws.service';
import { ThrowsController } from './throws.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ThrowsController],
  providers: [ThrowsService],
  exports: [ThrowsService],
})
export class ThrowsModule {}
