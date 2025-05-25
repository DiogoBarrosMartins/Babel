import { Injectable } from '@nestjs/common';
import { CreateVillageDto } from './dto/create-village.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';
import { Village } from '@prisma/client';
import { ResourceService } from '../resource/resource.service';

@Injectable()
export class VillageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly resourceService: ResourceService,
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

  async findByPlayer(playerId: string): Promise<Village[]> {
    const village = this.resourceService.getResources(playerId);
    if (!village) {
      throw new Error(`No village found for player ${playerId}`);
    }
    return this.prisma.village.findMany({
      where: { playerId },
    });
  }

  async remove(id: string) {
    await this.prisma.village.delete({ where: { id } });
    await this.kafka.emit('village.deleted', { id });
    return { message: `Village ${id} deleted` };
  }
}
