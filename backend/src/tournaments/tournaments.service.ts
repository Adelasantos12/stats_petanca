import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthCoach } from '../auth/current-coach.decorator';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { AddEntryDto } from './dto/add-entry.dto';
import { RecordResultDto } from './dto/record-result.dto';
import { roundRobin, singleElim, PairPlan } from './pairings';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTournamentDto, coach: AuthCoach) {
    return this.prisma.tournament.create({
      data: {
        name: dto.name.trim(),
        format: dto.format,
        modality: dto.modality ?? 'DOUBLES',
        targetPoints: dto.targetPoints ?? 13,
        organizerId: coach.id,
      },
    });
  }

  async listMine(coach: AuthCoach) {
    const where = coach.role === 'SUPER_ADMIN' ? {} : { organizerId: coach.id };
    return this.prisma.tournament.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { entries: true } } },
    });
  }

  private async getOwned(id: string, coach: AuthCoach) {
    const t = await this.prisma.tournament.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Torneo no encontrado');
    if (coach.role !== 'SUPER_ADMIN' && t.organizerId !== coach.id) {
      throw new ForbiddenException('Este torneo no es tuyo');
    }
    return t;
  }

  async addEntry(id: string, dto: AddEntryDto, coach: AuthCoach) {
    const t = await this.getOwned(id, coach);
    if (t.status !== 'SETUP') {
      throw new BadRequestException('Solo puedes inscribir antes de iniciar el torneo');
    }
    return this.prisma.tournamentEntry.create({
      data: { tournamentId: id, name: dto.name.trim(), seed: dto.seed ?? null },
    });
  }

  async removeEntry(entryId: string, coach: AuthCoach) {
    const entry = await this.prisma.tournamentEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Participante no encontrado');
    const t = await this.getOwned(entry.tournamentId, coach);
    if (t.status !== 'SETUP') {
      throw new BadRequestException('No puedes quitar participantes tras iniciar');
    }
    await this.prisma.tournamentEntry.delete({ where: { id: entryId } });
    return { deleted: true };
  }

  /** Vista completa con nombres resueltos en los cruces (para standings y bracket). */
  async getOne(id: string) {
    const t = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        entries: { orderBy: [{ seed: 'asc' }, { name: 'asc' }] },
        rounds: {
          orderBy: { number: 'asc' },
          include: { pairings: { orderBy: { slot: 'asc' } } },
        },
      },
    });
    if (!t) throw new NotFoundException('Torneo no encontrado');

    const nameOf = (eid: string | null) =>
      eid ? t.entries.find((e) => e.id === eid)?.name ?? null : null;

    const rounds = t.rounds.map((r) => ({
      ...r,
      pairings: r.pairings.map((p) => ({
        ...p,
        entryAName: nameOf(p.entryAId),
        entryBName: nameOf(p.entryBId),
        winnerName: nameOf(p.winnerEntryId),
      })),
    }));

    const standings =
      t.format === 'ROUND_ROBIN'
        ? [...t.entries].sort(
            (a, b) =>
              b.wins - a.wins ||
              b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst) ||
              b.pointsFor - a.pointsFor,
          )
        : [];

    return { ...t, rounds, standings };
  }

  async start(id: string, coach: AuthCoach) {
    const t = await this.getOwned(id, coach);
    if (t.status !== 'SETUP') throw new BadRequestException('El torneo ya fue iniciado');
    const entries = await this.prisma.tournamentEntry.findMany({
      where: { tournamentId: id },
      orderBy: [{ seed: 'asc' }, { name: 'asc' }],
    });
    if (entries.length < 2) throw new BadRequestException('Necesitas al menos 2 participantes');

    const ids = entries.map((e) => e.id);
    const plan: PairPlan[][] =
      t.format === 'SINGLE_ELIM' ? singleElim(ids) : roundRobin(ids);
    const isBracket = t.format === 'SINGLE_ELIM';

    await this.prisma.$transaction(async (tx) => {
      const created: { id: string; slot: number }[][] = [];
      for (let r = 0; r < plan.length; r++) {
        const round = await tx.round.create({
          data: { tournamentId: id, number: r + 1 },
        });
        const rowRows: { id: string; slot: number }[] = [];
        for (const pp of plan[r]) {
          const pairing = await tx.pairing.create({
            data: {
              roundId: round.id,
              slot: pp.slot,
              entryAId: pp.entryAId,
              entryBId: pp.entryBId,
            },
          });
          rowRows.push({ id: pairing.id, slot: pp.slot });
        }
        created.push(rowRows);
      }

      if (isBracket) {
        // enlaza el árbol
        for (let r = 0; r < created.length - 1; r++) {
          for (const cur of created[r]) {
            const parent = created[r + 1][Math.floor(cur.slot / 2)];
            await tx.pairing.update({
              where: { id: cur.id },
              data: { nextPairingId: parent.id },
            });
          }
        }
        // auto-avanza los BYE de la primera ronda
        const firstRound = plan[0];
        for (let i = 0; i < firstRound.length; i++) {
          const pp = firstRound[i];
          const hasA = !!pp.entryAId;
          const hasB = !!pp.entryBId;
          if (hasA !== hasB) {
            const winner = (pp.entryAId ?? pp.entryBId) as string;
            const cur = created[0][i];
            await tx.pairing.update({
              where: { id: cur.id },
              data: { winnerEntryId: winner },
            });
            await this.advance(tx, cur.id, pp.slot, winner);
          }
        }
      }

      await tx.tournament.update({ where: { id }, data: { status: 'RUNNING' } });
    });

    return this.getOne(id);
  }

  async recordResult(pairingId: string, dto: RecordResultDto, coach: AuthCoach) {
    const pairing = await this.prisma.pairing.findUnique({
      where: { id: pairingId },
      include: { round: { include: { tournament: true } } },
    });
    if (!pairing) throw new NotFoundException('Cruce no encontrado');
    const t = await this.getOwned(pairing.round.tournamentId, coach);
    if (!pairing.entryAId || !pairing.entryBId) {
      throw new BadRequestException('Este cruce aún no tiene ambos participantes');
    }
    if (dto.scoreA === dto.scoreB) {
      throw new BadRequestException('En petanca no hay empates: debe haber un ganador');
    }
    const winnerEntryId = dto.scoreA > dto.scoreB ? pairing.entryAId : pairing.entryBId;

    await this.prisma.pairing.update({
      where: { id: pairingId },
      data: { scoreA: dto.scoreA, scoreB: dto.scoreB, winnerEntryId },
    });

    if (t.format === 'ROUND_ROBIN') {
      await this.recomputeStandings(t.id);
    } else {
      await this.prisma.$transaction(async (tx) => {
        await this.advance(tx, pairingId, pairing.slot, winnerEntryId);
        if (!pairing.nextPairingId) {
          await tx.tournament.update({ where: { id: t.id }, data: { status: 'FINISHED' } });
        }
      });
    }
    return this.getOne(t.id);
  }

  // Coloca al ganador en el cruce padre (A si el slot hijo es par, B si impar).
  private async advance(
    tx: PrismaService | any,
    pairingId: string,
    slot: number,
    winnerEntryId: string,
  ) {
    const cur = await tx.pairing.findUnique({ where: { id: pairingId } });
    if (!cur?.nextPairingId) return;
    const data = slot % 2 === 0 ? { entryAId: winnerEntryId } : { entryBId: winnerEntryId };
    await tx.pairing.update({ where: { id: cur.nextPairingId }, data });
  }

  private async recomputeStandings(tournamentId: string) {
    const entries = await this.prisma.tournamentEntry.findMany({ where: { tournamentId } });
    const rounds = await this.prisma.round.findMany({
      where: { tournamentId },
      include: { pairings: true },
    });
    const tally = new Map<string, { played: number; wins: number; losses: number; pf: number; pa: number }>();
    entries.forEach((e) => tally.set(e.id, { played: 0, wins: 0, losses: 0, pf: 0, pa: 0 }));

    for (const r of rounds) {
      for (const p of r.pairings) {
        if (p.scoreA == null || p.scoreB == null || !p.entryAId || !p.entryBId) continue;
        const a = tally.get(p.entryAId);
        const b = tally.get(p.entryBId);
        if (!a || !b) continue;
        a.played++; b.played++;
        a.pf += p.scoreA; a.pa += p.scoreB;
        b.pf += p.scoreB; b.pa += p.scoreA;
        if (p.scoreA > p.scoreB) { a.wins++; b.losses++; } else { b.wins++; a.losses++; }
      }
    }

    for (const [id, s] of tally) {
      await this.prisma.tournamentEntry.update({
        where: { id },
        data: { played: s.played, wins: s.wins, losses: s.losses, pointsFor: s.pf, pointsAgainst: s.pa },
      });
    }
  }
}
