import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Niveles por defecto (recorrido del jugador) con rúbricas de ejemplo editables.
const DEFAULT_LEVELS: {
  name: string;
  order: number;
  description: string;
  criteria: { label: string; dimension?: string; target: number; unit?: string }[];
}[] = [
  {
    name: 'Iniciación',
    order: 1,
    description: 'Postura, agarre y reglas básicas del juego.',
    criteria: [],
  },
  {
    name: 'Bronce',
    order: 2,
    description: 'Point a corta distancia y primer tir.',
    criteria: [
      { label: 'Point a 6 m (serie de 10)', dimension: 'E', target: 50 },
      { label: 'Tir a 6 m', dimension: 'E', target: 30 },
    ],
  },
  {
    name: 'Plata',
    order: 3,
    description: 'Tir a media distancia, lectura de terreno y decisión.',
    criteria: [
      { label: 'Tir a 7-8 m', dimension: 'E', target: 55 },
      { label: 'Point a 8 m', dimension: 'E', target: 55 },
      { label: 'Decisión point/tir correcta', dimension: 'C', target: 60 },
    ],
  },
  {
    name: 'Oro',
    order: 4,
    description: 'Carreau consistente, táctica de dobletes y regularidad.',
    criteria: [
      { label: 'Carreau a 8 m', dimension: 'E', target: 35 },
      { label: 'Regularidad en serie de 20', dimension: 'R', target: 65 },
    ],
  },
  {
    name: 'Élite',
    order: 5,
    description: 'Alto rendimiento y juego completo de competición.',
    criteria: [
      { label: 'Tir a 9 m', dimension: 'E', target: 60 },
      { label: 'Point a 9-10 m', dimension: 'E', target: 60 },
    ],
  },
];

@Injectable()
export class LevelsService implements OnModuleInit {
  private readonly logger = new Logger(LevelsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Siembra los niveles al arrancar para que estén disponibles en todo el sistema
  // (evaluaciones del coach y vista del jugador), sin depender de quién llame primero.
  async onModuleInit() {
    try {
      await this.ensureSeeded();
    } catch (e) {
      this.logger.warn(`No se pudieron sembrar los niveles al arrancar: ${e}`);
    }
  }

  /** Crea los niveles por defecto si aún no existen. Idempotente. */
  async ensureSeeded() {
    const count = await this.prisma.level.count();
    if (count > 0) return;
    for (const lvl of DEFAULT_LEVELS) {
      await this.prisma.level.create({
        data: {
          name: lvl.name,
          order: lvl.order,
          description: lvl.description,
          criteria: {
            create: lvl.criteria.map((c, i) => ({
              label: c.label,
              dimension: c.dimension ?? null,
              target: c.target,
              unit: c.unit ?? '%',
              order: i,
            })),
          },
        },
      });
    }
  }

  async findAll() {
    await this.ensureSeeded();
    return this.prisma.level.findMany({
      orderBy: { order: 'asc' },
      include: { criteria: { orderBy: { order: 'asc' } } },
    });
  }

  async addCriterion(
    levelId: string,
    data: { label: string; dimension?: string; target: number; unit?: string },
  ) {
    const count = await this.prisma.levelCriterion.count({ where: { levelId } });
    return this.prisma.levelCriterion.create({
      data: {
        levelId,
        label: data.label,
        dimension: data.dimension ?? null,
        target: data.target,
        unit: data.unit ?? '%',
        order: count,
      },
    });
  }

  async removeCriterion(id: string) {
    await this.prisma.levelCriterion.delete({ where: { id } });
    return { deleted: true };
  }
}
