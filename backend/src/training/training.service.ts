import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCoach } from '../auth/current-coach.decorator';
import { DEFAULT_DRILLS } from '../merci/merci';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateDrillDto } from './dto/create-drill.dto';
import { LogSessionDto } from './dto/log-session.dto';

@Injectable()
export class TrainingService implements OnModuleInit {
  private readonly logger = new Logger(TrainingService.name);
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureDrillsSeeded();
    } catch (e) {
      this.logger.warn(`No se pudieron sembrar los ejercicios: ${e}`);
    }
  }

  async ensureDrillsSeeded() {
    const count = await this.prisma.drill.count({ where: { coachId: null } });
    if (count > 0) return;
    await this.prisma.drill.createMany({
      data: DEFAULT_DRILLS.map((d) => ({ ...d, coachId: null })),
    });
  }

  // ---- Ejercicios ----
  async listDrills() {
    await this.ensureDrillsSeeded();
    return this.prisma.drill.findMany({ orderBy: [{ dimension: 'asc' }, { title: 'asc' }] });
  }

  async addDrill(dto: CreateDrillDto, coach: AuthCoach) {
    return this.prisma.drill.create({
      data: {
        title: dto.title.trim(),
        dimension: dto.dimension,
        description: dto.description ?? null,
        targetMetric: dto.targetMetric ?? null,
        coachId: coach.id,
      },
    });
  }

  // ---- Planes (coach) ----
  private async assertPlayerAccess(playerId: string, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { coachId: true },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    if (coach.role !== 'SUPER_ADMIN' && player.coachId !== coach.id) {
      throw new ForbiddenException('Este jugador no pertenece a tu roster');
    }
  }

  async createPlan(playerId: string, coach: AuthCoach, dto: CreatePlanDto) {
    await this.assertPlayerAccess(playerId, coach);
    // El nuevo plan pasa a ser el activo: archiva los anteriores activos.
    await this.prisma.trainingPlan.updateMany({
      where: { playerId, status: 'ACTIVE' },
      data: { status: 'ARCHIVED' },
    });
    return this.prisma.trainingPlan.create({
      data: {
        playerId,
        coachId: coach.id,
        name: dto.name.trim(),
        focus: dto.focus ?? null,
        items: {
          create: dto.items.map((it, i) => ({
            drillId: it.drillId,
            week: it.week ?? 1,
            reps: it.reps ?? 1,
            order: i,
          })),
        },
      },
      include: { items: { include: { drill: true } } },
    });
  }

  async plansForPlayer(playerId: string, coach: AuthCoach) {
    await this.assertPlayerAccess(playerId, coach);
    return this.prisma.trainingPlan.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { drill: true }, orderBy: { order: 'asc' } } },
    });
  }

  async sessionsForPlayer(playerId: string, coach: AuthCoach) {
    await this.assertPlayerAccess(playerId, coach);
    return this.prisma.trainingSession.findMany({
      where: { playerId },
      orderBy: { date: 'desc' },
      include: { results: true },
    });
  }

  // ---- Vista y registro del jugador (self) ----
  async activePlanForSelf(playerId: string) {
    return this.prisma.trainingPlan.findFirst({
      where: { playerId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { drill: true }, orderBy: { order: 'asc' } } },
    });
  }

  async logSession(playerId: string, dto: LogSessionDto) {
    return this.prisma.trainingSession.create({
      data: {
        playerId,
        planId: dto.planId ?? null,
        mood: dto.mood ?? null,
        notes: dto.notes ?? null,
        results: {
          create: (dto.results ?? []).map((r) => ({
            drillId: r.drillId ?? null,
            label: r.label,
            attempts: r.attempts ?? null,
            successes: r.successes ?? null,
            avgScore: r.avgScore ?? null,
            done: r.done ?? true,
          })),
        },
      },
      include: { results: true },
    });
  }

  async sessionsForSelf(playerId: string) {
    return this.prisma.trainingSession.findMany({
      where: { playerId },
      orderBy: { date: 'desc' },
      include: { results: true },
    });
  }
}
