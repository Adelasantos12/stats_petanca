import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCoach } from '../auth/current-coach.decorator';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getPlayerOrThrow(id: string, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    if (coach.role !== 'SUPER_ADMIN' && player.coachId !== coach.id) {
      throw new ForbiddenException('Este jugador no pertenece a tu roster');
    }
    return player;
  }

  /**
   * Sugiere el siguiente nivel a evaluar (el de orden inmediatamente superior
   * al nivel actual del jugador) y devuelve sus criterios para prellenar la rúbrica.
   */
  async nextLevel(playerId: string, coach: AuthCoach) {
    const player = await this.getPlayerOrThrow(playerId, coach);
    const levels = await this.prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: { criteria: { orderBy: { order: 'asc' } } },
    });

    const current = levels.find((l) => l.name === player.level) ?? null;
    const currentOrder = current?.order ?? 0;
    const next = levels.find((l) => l.order > currentOrder) ?? null;

    return {
      currentLevel: current ? { id: current.id, name: current.name } : null,
      nextLevel: next,
      atMax: !next,
    };
  }

  async create(playerId: string, coach: AuthCoach, dto: CreateEvaluationDto) {
    const player = await this.getPlayerOrThrow(playerId, coach);

    const items = dto.items.map((it) => {
      const score = it.attempts > 0 ? (it.successes / it.attempts) * 100 : 0;
      return {
        criterionId: it.criterionId ?? null,
        label: it.label,
        target: it.target,
        attempts: it.attempts,
        successes: it.successes,
        score: parseFloat(score.toFixed(1)),
        met: score >= it.target,
      };
    });

    const passed = items.length > 0 && items.every((i) => i.met);

    let targetLevelName: string | null = null;
    if (dto.targetLevelId) {
      const level = await this.prisma.level.findUnique({
        where: { id: dto.targetLevelId },
      });
      targetLevelName = level?.name ?? null;
    }

    return this.prisma.$transaction(async (tx) => {
      const evaluation = await tx.evaluation.create({
        data: {
          playerId: player.id,
          coachId: coach.id,
          targetLevelId: dto.targetLevelId ?? null,
          notes: dto.notes ?? null,
          passed,
          items: { create: items },
        },
        include: { items: true, targetLevel: true },
      });

      let promoted = false;
      if (passed && targetLevelName && player.level !== targetLevelName) {
        await tx.player.update({
          where: { id: player.id },
          data: { level: targetLevelName },
        });
        promoted = true;
      }

      return { ...evaluation, promoted, newLevel: promoted ? targetLevelName : null };
    });
  }

  async findForPlayer(playerId: string, coach: AuthCoach) {
    await this.getPlayerOrThrow(playerId, coach);
    return this.prisma.evaluation.findMany({
      where: { playerId },
      orderBy: { date: 'desc' },
      include: { items: true, targetLevel: { select: { name: true } } },
    });
  }
}
