import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { CloseHandDto } from './dto/close-hand.dto';
import { FinishMatchDto } from './dto/finish-match.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(createMatchDto: CreateMatchDto) {
    try {
      const { modality, targetPoints, teamAName, teamBName, playersA, playersB } =
        createMatchDto;

      return await this.prisma.$transaction(async (tx) => {
        const match = await tx.match.create({
          data: {
            modality,
            targetPoints,
            teamAName,
            teamBName,
          },
        });

        const allPlayers = [
          ...playersA.map((name) => ({ name, side: 'A' })),
          ...playersB.map((name) => ({ name, side: 'B' })),
        ];

        for (const p of allPlayers) {
          const player = await tx.player.create({
            data: { name: p.name },
          });
          await tx.matchPlayer.create({
            data: {
              matchId: match.id,
              playerId: player.id,
              teamSide: p.side,
            },
          });
        }

        return tx.match.findUnique({
          where: { id: match.id },
          include: {
            players: {
              include: { player: true },
            },
            hands: true,
            throws: {
              include: { player: true },
            },
          },
        });
      });
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }

  async findAll() {
    return this.prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        players: {
          include: { player: true },
        },
        hands: true,
        throws: {
          include: { player: true },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async closeHand(id: string, closeHandDto: CloseHandDto) {
    const match = await this.findOne(id);
    const handNumber = match.hands.length + 1;

    return this.prisma.hand.create({
      data: {
        matchId: id,
        handNumber,
        status: 'NORMAL',
        pointsTeam: closeHandDto.pointsTeam,
        pointsValue: closeHandDto.pointsValue,
      },
    });
  }

  async cancelHand(id: string) {
    const match = await this.findOne(id);
    const handNumber = match.hands.length + 1;

    return this.prisma.hand.create({
      data: {
        matchId: id,
        handNumber,
        status: 'CANCELED',
      },
    });
  }

  async finish(id: string, finishMatchDto: FinishMatchDto) {
    return this.prisma.match.update({
      where: { id },
      data: {
        status: 'FINISHED',
        endReason: finishMatchDto.endReason,
        endedAt: new Date(),
      },
    });
  }

  async getPerformance(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        players: { include: { player: true } },
        hands: true,
        throws: true,
      },
    });

    if (!match) throw new NotFoundException();

    // If no hands recorded yet, we still might want to calculate based on all throws,
    // but the requirement says "Excluir manos anuladas del cálculo por defecto".
    // Usually throws are associated with a handNumber.

    const validThrows = match.throws.filter((t) => {
      const hand = match.hands.find((h) => h.handNumber === t.handNumber);
      return !hand || hand.status === 'NORMAL';
    });

    const playersPerformance = match.players.map((mp) => {
      const playerThrows = validThrows.filter(
        (t) => t.playerId === mp.playerId,
      );
      const pointThrows = playerThrows.filter((t) => t.throwType === 'POINT');
      const tirThrows = playerThrows.filter((t) => t.throwType === 'TIR');

      return {
        playerId: mp.playerId,
        playerName: mp.player.name,
        teamSide: mp.teamSide,
        total: this.calculateMetrics(playerThrows),
        point: this.calculateMetrics(pointThrows),
        tir: this.calculateMetrics(tirThrows),
      };
    });

    const teamAPerformance = this.calculateMetrics(
      validThrows.filter((t) => t.teamSide === 'A'),
    );
    const teamBPerformance = this.calculateMetrics(
      validThrows.filter((t) => t.teamSide === 'B'),
    );

    return {
      players: playersPerformance,
      teams: {
        A: teamAPerformance,
        B: teamBPerformance,
      },
    };
  }

  private calculateMetrics(throws: { effectivenessScore: number }[]) {
    const n = throws.length;
    if (n === 0) {
      return { 
        n: 0, 
        suma: 0, 
        media: null, 
        performance: null,
        dist: { '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0 },
        pcts: { positivas: 0, negativas: 0, extremas: 0 },
        sd: 0,
        stability: 'Estable' 
      };
    }

    const suma = throws.reduce((acc, t) => acc + t.effectivenessScore, 0);
    const media = suma / n;
    const performance = ((suma + 2 * n) / (4 * n)) * 100;

    const dist = { '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0 };
    let sumSq = 0;
    
    throws.forEach(t => {
      const s = t.effectivenessScore;
      if (s === -2) dist['-2']++;
      else if (s === -1) dist['-1']++;
      else if (s === 0) dist['0']++;
      else if (s === 1) dist['1']++;
      else if (s === 2) dist['2']++;
      
      sumSq += Math.pow(s - media, 2);
    });

    const positivas = ((dist['1'] + dist['2']) / n) * 100;
    const negativas = ((dist['-1'] + dist['-2']) / n) * 100;
    const extremas = ((dist['-2'] + dist['2']) / n) * 100;

    const variance = sumSq / n;
    const sd = Math.sqrt(variance);
    let stability = 'Estable';
    if (sd > 1.2) stability = 'Volátil';
    else if (sd > 0.8) stability = 'Moderado';

    return {
      n,
      suma,
      media: parseFloat(media.toFixed(2)),
      performance: parseFloat(performance.toFixed(1)),
      dist,
      pcts: {
        positivas: parseFloat(positivas.toFixed(1)),
        negativas: parseFloat(negativas.toFixed(1)),
        extremas: parseFloat(extremas.toFixed(1)),
      },
      sd: parseFloat(sd.toFixed(2)),
      stability
    };
  }
}
