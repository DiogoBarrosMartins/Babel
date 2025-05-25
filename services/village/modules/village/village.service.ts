import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVillageDto } from './dto/create-village.dto';
import { UpdateVillageDto } from './dto/update-village.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VillageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async create(dto: CreateVillageDto) {
    const requestId = uuidv4();

    await this.kafka.emit('world.village-tile.requested', {
      race: dto.race,
      playerId: dto.playerId,
      playerName: dto.playerName,
      name: dto.name,
    });
    console.log(
      `Tile request sent for player ${dto.playerName} with request ID ${requestId}`,
    );
    return { message: 'Tile request sent. Awaiting world service response.' };
  }

  async handleTileAllocated(data: {
    playerId: string;
    playerName: string;
    x: number;
    y: number;
    name: string;
  }) {
    const village = await this.prisma.village.create({
      data: {
        playerId: data.playerId,
        playerName: data.playerName,
        x: data.x,
        y: data.y,
        name: data.name,

        // Default resource values
        resourceAmounts: {
          wood: 500,
          clay: 500,
          iron: 500,
          grain: 500,
        },
        resourceProductionRates: {
          wood: 10,
          clay: 10,
          iron: 10,
          grain: 8,
        },
        lastCollectedAt: new Date(),
      },
    });

    await this.kafka.emit('village.created', {
      id: village.id,
      name: village.name,
      playerId: village.playerId,
      race: village.race,
      x: village.x,
      y: village.y,
    });
    console.log(
      `Village ${village.name} created at (${village.x}, ${village.y}) for player ${village.playerId}`,
    );
    return village;
  }

  findAll() {
    return this.prisma.village.findMany();
  }

  async findOne(id: string) {
    const v = await this.prisma.village.findUnique({ where: { id } });
    if (!v) throw new NotFoundException(`Village ${id} not found`);
    return v;
  }

  async update(id: number, data: UpdateVillageDto) {
    const village = await this.prisma.village.update({
      where: { id },
      data,
    });
    await this.kafka.emit('village.updated', {
      id: village.id,
      name: village.name,
      updatedAt: village.updatedAt,
    });
    return village;
  }

  async remove(id: string) {
    await this.prisma.village.delete({ where: { id } });
    await this.kafka.emit('village.deleted', { id });
    return { message: `Village ${id} deleted` };
  }
}
