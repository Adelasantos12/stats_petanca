import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCoach } from '../auth/current-coach.decorator';
import { MERCI_DIMENSIONS } from './merci';
import { MERCI_QUESTIONS } from './merci-questions';
import { CreateMerciDto } from './dto/create-merci.dto';

const DIMS = ['M', 'E', 'R', 'C', 'I'] as const;

@Injectable()
export class MerciService {
  constructor(private readonly prisma: PrismaService) {}

  getQuestions() {
    return { dimensions: MERCI_DIMENSIONS, questions: MERCI_QUESTIONS };
  }

  private async assertAccess(playerId: string, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { coachId: true },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    if (coach.role !== 'SUPER_ADMIN' && player.coachId !== coach.id) {
      throw new ForbiddenException('Este jugador no pertenece a tu roster');
    }
  }

  async create(playerId: string, coach: AuthCoach, dto: CreateMerciDto) {
    await this.assertAccess(playerId, coach);

    const items: { code: string; dimension: string; score: number }[] = [];
    const sums: Record<string, number> = { M: 0, E: 0, R: 0, C: 0, I: 0 };

    for (const q of MERCI_QUESTIONS) {
      const raw = dto.scores?.[q.code];
      const score = Number(raw);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new BadRequestException(
          `Falta o es inválida la puntuación de la pregunta ${q.code} (debe ser 1-5)`,
        );
      }
      sums[q.dimension] += score;
      items.push({ code: q.code, dimension: q.dimension, score });
    }

    // 6 preguntas por dimensión × 5 = 30 máx; normalizamos a 0-100.
    const pct = (sum: number, maxItems: number) =>
      parseFloat(((sum / (maxItems * 5)) * 100).toFixed(1));
    const perDim = Object.fromEntries(
      DIMS.map((d) => [d, pct(sums[d], 6)]),
    ) as Record<string, number>;
    const total = pct(
      DIMS.reduce((a, d) => a + sums[d], 0),
      MERCI_QUESTIONS.length,
    );

    return this.prisma.merciAssessment.create({
      data: {
        playerId,
        coachId: coach.id,
        notes: dto.notes ?? null,
        scoreM: perDim.M,
        scoreE: perDim.E,
        scoreR: perDim.R,
        scoreC: perDim.C,
        scoreI: perDim.I,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
  }

  async historyForPlayer(playerId: string, coach: AuthCoach) {
    await this.assertAccess(playerId, coach);
    return this.list(playerId);
  }

  async historyForSelf(playerId: string) {
    return this.list(playerId);
  }

  private list(playerId: string) {
    return this.prisma.merciAssessment.findMany({
      where: { playerId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        notes: true,
        scoreM: true,
        scoreE: true,
        scoreR: true,
        scoreC: true,
        scoreI: true,
        total: true,
      },
    });
  }
}
