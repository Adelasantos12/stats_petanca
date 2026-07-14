import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { AuthCoach } from '../auth/current-coach.decorator';
import { calculateMetrics } from '../scoring/scoring';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Un SUPER_ADMIN ve todo el roster; un COACH solo sus propios jugadores.
   */
  async findAll(coach: AuthCoach) {
    const where =
      coach.role === 'SUPER_ADMIN' ? {} : { coachId: coach.id };
    return this.prisma.player.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        coach: { select: { id: true, name: true } },
        _count: { select: { matches: true, throws: true } },
      },
    });
  }

  async findOne(id: string, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        coach: { select: { id: true, name: true } },
        _count: { select: { matches: true, throws: true } },
      },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    this.assertAccess(player, coach);
    return player;
  }

  async create(dto: CreatePlayerDto, coach: AuthCoach) {
    return this.prisma.player.create({
      data: {
        name: dto.name.trim(),
        email: dto.email?.trim().toLowerCase() || null,
        category: dto.category || null,
        level: dto.level || null,
        notes: dto.notes || null,
        coachId: coach.id,
      },
    });
  }

  async update(id: string, dto: UpdatePlayerDto, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    this.assertAccess(player, coach);

    return this.prisma.player.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email?.trim().toLowerCase() || null } : {}),
        ...(dto.category !== undefined ? { category: dto.category || null } : {}),
        ...(dto.level !== undefined ? { level: dto.level || null } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes || null } : {}),
      },
    });
  }

  async remove(id: string, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { _count: { select: { matches: true, throws: true } } },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    this.assertAccess(player, coach);

    // No borramos jugadores con historial: los desvinculamos del roster para
    // no romper partidas ya registradas.
    if (player._count.matches > 0 || player._count.throws > 0) {
      await this.prisma.player.update({
        where: { id },
        data: { coachId: null },
      });
      return { detached: true };
    }

    await this.prisma.player.delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Desarrollo agregado del jugador: performance acumulado (total, point y tir)
   * a lo largo de TODAS sus partidas, más su evolución partido a partido.
   * Excluye los lanzamientos de manos anuladas, igual que el performance de partido.
   */
  async getDevelopment(id: string, coach: AuthCoach) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      select: { coachId: true },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');
    this.assertAccess(player, coach);
    return this.computeDevelopment(id);
  }

  /** Igual que getDevelopment pero sin control de coach: el jugador ve lo suyo. */
  async getDevelopmentForSelf(id: string) {
    return this.computeDevelopment(id);
  }

  private async computeDevelopment(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { throws: true },
    });
    if (!player) throw new NotFoundException('Jugador no encontrado');

    const matchIds = [...new Set(player.throws.map((t) => t.matchId))];

    const [canceledHands, matches] = await Promise.all([
      this.prisma.hand.findMany({
        where: { matchId: { in: matchIds }, status: 'CANCELED' },
        select: { matchId: true, handNumber: true },
      }),
      this.prisma.match.findMany({
        where: { id: { in: matchIds } },
        select: {
          id: true,
          createdAt: true,
          teamAName: true,
          teamBName: true,
          status: true,
        },
      }),
    ]);

    const canceled = new Set(
      canceledHands.map((h) => `${h.matchId}:${h.handNumber}`),
    );
    const validThrows = player.throws.filter(
      (t) => !canceled.has(`${t.matchId}:${t.handNumber}`),
    );

    const matchById = new Map(matches.map((m) => [m.id, m]));
    const perMatch = matchIds
      .map((mid) => {
        const m = matchById.get(mid);
        const throws = validThrows.filter((t) => t.matchId === mid);
        return {
          matchId: mid,
          date: m?.createdAt ?? null,
          teams: m ? `${m.teamAName} vs ${m.teamBName}` : null,
          status: m?.status ?? null,
          ...calculateMetrics(throws),
        };
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return da - db;
      });

    return {
      player: {
        id: player.id,
        name: player.name,
        level: player.level,
        category: player.category,
        notes: player.notes,
      },
      matchesPlayed: matchIds.length,
      total: calculateMetrics(validThrows),
      point: calculateMetrics(
        validThrows.filter((t) => t.throwType === 'POINT'),
      ),
      tir: calculateMetrics(validThrows.filter((t) => t.throwType === 'TIR')),
      perMatch,
    };
  }

  private assertAccess(player: { coachId: string | null }, coach: AuthCoach) {
    if (coach.role === 'SUPER_ADMIN') return;
    if (player.coachId !== coach.id) {
      throw new ForbiddenException('Este jugador no pertenece a tu roster');
    }
  }
}
