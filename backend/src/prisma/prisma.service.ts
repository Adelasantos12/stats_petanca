import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (err: any) {
      this.logger.error(
        `Prisma failed to connect on startup: ${err?.message ?? err}`,
      );
      // NO re-lanzar: permite que el servidor HTTP levante y Railway pase healthchecks.
    }
  }
}
