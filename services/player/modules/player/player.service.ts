import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { KafkaService } from '../../../../libs/kafka/kafka.service';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async create(dto: CreatePlayerDto) {
    const player = await this.prisma.player.create({ data: dto });

    await this.kafka.emit('player.created', {
      id: player.id,
      username: player.username,
      email: player.email,
      createdAt: player.createdAt,
    });

    return player;
  }

  async findAll() {
    return this.prisma.player.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.player.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async update(id: string, data: Partial<CreatePlayerDto>) {
    const player = await this.prisma.player.update({
      where: { id },
      data,
    });

    await this.kafka.emit('player.updated', {
      id: player.id,
      username: player.username,
      email: player.email,
      updatedAt: player.updatedAt,
    });

    return player;
  }

  async softDelete(id: string) {
    const player = await this.prisma.player.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.kafka.emit('player.deleted', { id: player.id });

    return { message: 'Player marked as deleted' };
  }
}
