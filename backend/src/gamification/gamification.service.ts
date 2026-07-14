import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateMetrics } from '../scoring/scoring';
import { AuthCoach } from '../auth/current-coach.decorator';

const LEVEL_ORDER: Record<string, number> = {
  Iniciación: 1, Bronce: 2, Plata: 3, Oro: 4, Élite: 5,
};

// Niveles de estatus por XP (el estatus solo vale si los demás lo ven).
const STATUS_TIERS = [
  { name: 'Novato', min: 0 },
  { name: 'Aficionado', min: 100 },
  { name: 'Habitual', min: 300 },
  { name: 'Tirador', min: 600 },
  { name: 'Maestro', min: 1200 },
  { name: 'Leyenda del parque', min: 2500 },
];

interface BadgeDef {
  code: string;
  name: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD';
  desc: string;
  earned: (c: Ctx) => boolean;
  progress?: (c: Ctx) => string;
}

interface Ctx {
  throws: number;
  matches: number;
  hasCarreau: boolean;
  bestTir: number;
  bestPoint: number;
  bestStreak: number;
  hasMerci: boolean;
  levelOrder: number;
}

const BADGES: BadgeDef[] = [
  { code: 'first_throw', name: 'Primer lanzamiento', tier: 'BRONZE', desc: 'Registra tu primer lanzamiento', earned: (c) => c.throws >= 1, progress: (c) => `${Math.min(c.throws, 1)}/1` },
  { code: 'consistent', name: 'Constante', tier: 'BRONZE', desc: '20 lanzamientos registrados', earned: (c) => c.throws >= 20, progress: (c) => `${Math.min(c.throws, 20)}/20` },
  { code: 'carreau', name: '¡Carreau!', tier: 'GOLD', desc: 'Logra un tir perfecto (+2)', earned: (c) => c.hasCarreau },
  { code: 'sniper', name: 'Francotirador', tier: 'SILVER', desc: '≥60% de eficacia en tir en una partida', earned: (c) => c.bestTir >= 60, progress: (c) => `${Math.round(c.bestTir)}%/60%` },
  { code: 'pointer', name: 'Puntería', tier: 'SILVER', desc: '≥70% de eficacia en point en una partida', earned: (c) => c.bestPoint >= 70, progress: (c) => `${Math.round(c.bestPoint)}%/70%` },
  { code: 'veteran', name: 'Veterano del parque', tier: 'GOLD', desc: 'Juega 10 partidas', earned: (c) => c.matches >= 10, progress: (c) => `${Math.min(c.matches, 10)}/10` },
  { code: 'streak3', name: 'En racha', tier: 'BRONZE', desc: '3 días seguidos jugando', earned: (c) => c.bestStreak >= 3, progress: (c) => `${Math.min(c.bestStreak, 3)}/3` },
  { code: 'streak7', name: 'Imparable', tier: 'GOLD', desc: '7 días seguidos jugando', earned: (c) => c.bestStreak >= 7, progress: (c) => `${Math.min(c.bestStreak, 7)}/7` },
  { code: 'evaluated', name: 'Bajo la lupa', tier: 'SILVER', desc: 'Recibe tu primera evaluación MERCI', earned: (c) => c.hasMerci },
  { code: 'silver_level', name: 'Nivel Plata', tier: 'SILVER', desc: 'Alcanza el nivel Plata', earned: (c) => c.levelOrder >= 3 },
];

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async forPlayer(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { throws: true, _count: { select: { merciAssessments: true } } },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');

    const throws = player.throws;
    const matchIds = [...new Set(throws.map((t) => t.matchId))];

    // mejor eficacia de tir/point por partida (con muestra mínima)
    let bestTir = 0;
    let bestPoint = 0;
    for (const mid of matchIds) {
      const mThrows = throws.filter((t) => t.matchId === mid);
      const tir = mThrows.filter((t) => t.throwType === 'TIR');
      const point = mThrows.filter((t) => t.throwType === 'POINT');
      if (tir.length >= 3) bestTir = Math.max(bestTir, calculateMetrics(tir).performance ?? 0);
      if (point.length >= 3) bestPoint = Math.max(bestPoint, calculateMetrics(point).performance ?? 0);
    }

    const { current: streak, best: bestStreak } = this.streaks(
      throws.map((t) => t.createdAt),
    );

    const ctx: Ctx = {
      throws: throws.length,
      matches: matchIds.length,
      hasCarreau: throws.some((t) => t.throwType === 'TIR' && t.effectivenessScore === 2),
      bestTir,
      bestPoint,
      bestStreak,
      hasMerci: player._count.merciAssessments > 0,
      levelOrder: player.level ? LEVEL_ORDER[player.level] ?? 0 : 0,
    };

    const badges = BADGES.map((b) => ({
      code: b.code,
      name: b.name,
      tier: b.tier,
      description: b.desc,
      earned: b.earned(ctx),
      progress: b.progress ? b.progress(ctx) : null,
    }));
    const earnedCount = badges.filter((b) => b.earned).length;

    const xp = ctx.matches * 10 + ctx.throws + earnedCount * 25;
    const status = this.status(xp);

    return {
      status,
      streak: { current: streak, best: bestStreak },
      stats: { matchesPlayed: ctx.matches, throwsLogged: ctx.throws, badgesEarned: earnedCount },
      badges,
    };
  }

  async forPlayerByCoach(id: string, coach: AuthCoach) {
    const p = await this.prisma.player.findUnique({
      where: { id },
      select: { coachId: true },
    });
    if (!p) throw new NotFoundException('Jugador no encontrado');
    if (coach.role !== 'SUPER_ADMIN' && p.coachId !== coach.id) {
      throw new ForbiddenException('Este jugador no pertenece a tu roster');
    }
    return this.forPlayer(id);
  }

  private status(xp: number) {
    let idx = 0;
    for (let i = 0; i < STATUS_TIERS.length; i++) if (xp >= STATUS_TIERS[i].min) idx = i;
    const tier = STATUS_TIERS[idx];
    const next = STATUS_TIERS[idx + 1] ?? null;
    const progress = next
      ? Math.round(((xp - tier.min) / (next.min - tier.min)) * 100)
      : 100;
    return {
      tier: tier.name,
      xp,
      nextTier: next?.name ?? null,
      xpToNext: next ? next.min - xp : 0,
      progress,
    };
  }

  // Racha de días consecutivos con actividad (actual y mejor histórica).
  private streaks(dates: Date[]) {
    if (dates.length === 0) return { current: 0, best: 0 };
    const days = [...new Set(dates.map((d) => d.toISOString().slice(0, 10)))].sort();
    const toNum = (s: string) => Math.floor(new Date(s + 'T00:00:00Z').getTime() / 86400000);
    const nums = days.map(toNum);

    let best = 1;
    let run = 1;
    for (let i = 1; i < nums.length; i++) {
      run = nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
      best = Math.max(best, run);
    }

    // racha actual: cuenta hacia atrás desde el último día activo si es hoy o ayer
    const today = Math.floor(Date.now() / 86400000);
    const last = nums[nums.length - 1];
    let current = 0;
    if (last === today || last === today - 1) {
      current = 1;
      for (let i = nums.length - 1; i > 0; i--) {
        if (nums[i] === nums[i - 1] + 1) current++;
        else break;
      }
    }
    return { current, best };
  }
}
