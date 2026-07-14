import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { AuthCoach } from '../auth/current-coach.decorator';

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
        email: dto.email?.trim() || null,
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
        ...(dto.email !== undefined ? { email: dto.email?.trim() || null } : {}),
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

  private assertAccess(player: { coachId: string | null }, coach: AuthCoach) {
    if (coach.role === 'SUPER_ADMIN') return;
    if (player.coachId !== coach.id) {
      throw new ForbiddenException('Este jugador no pertenece a tu roster');
    }
  }
}
