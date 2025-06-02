import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVillageDto } from './dto/create-village.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { v4 as uuidv4 } from 'uuid';
import { Village } from '@prisma/client';
import { ResourceService } from '../resource/resource.service';
import { BuildingService } from '../building/building.service';
import { ValidatedBattlePayload } from '../../../../libs/types/combat-type';
import { AttackRequestDto } from '../../../combat/modules/combat/dto/attack-request.dto';

@Injectable()
export class VillageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly resourceService: ResourceService,
    private readonly buildingService: BuildingService,
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
    race: string;
  }) {
    const existingVillage = await this.prisma.village.findFirst({
      where: {
        playerId: data.playerId,
        x: data.x,
        y: data.y,
      },
    });

    if (existingVillage) {
      console.warn(
        `Village already exists at (${data.x}, ${data.y}) for player ${data.playerId}`,
      );
      return existingVillage;
    }

    const village = await this.prisma.village.create({
      data: {
        playerId: data.playerId,
        playerName: data.playerName,
        x: data.x,
        y: data.y,
        name: data.name,

        resourceAmounts: {
          food: 500,
          wood: 500,
          stone: 500,
          gold: 500,
        },
        resourceProductionRates: {
          food: 10,
          wood: 10,
          stone: 10,
          gold: 8,
        },
        lastCollectedAt: new Date(),
      },
    });

    await this.buildingService.initializeBuildingsForVillage(
      village.id,
      data.race,
    );
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
    const villages = await this.prisma.village.findMany({
      where: { playerId },
    });
    if (villages.length === 0) {
      throw new NotFoundException(`No villages found for player ${playerId}`);
    }

    await Promise.all(
      villages.map((v) => this.resourceService.getResources(v.id)),
    );

    return this.prisma.village.findMany({
      where: { playerId },
      include: {
        buildings: true,
        troops: true,
        trainingTasks: {
          where: { status: { not: 'completed' } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    await this.prisma.village.delete({ where: { id } });
    await this.kafka.emit('village.deleted', { id });
    return { message: `Village ${id} deleted` };
  }

  async handleCombatUpdate(payload: {
    villageId: string;
    combat: {
      type: 'incoming' | 'outgoing';
      battleId: string;
      targetX?: number;
      targetY?: number;
      originX?: number;
      originY?: number;
      arrivalTime: string;
      [key: string]: any;
    };
  }) {
    const { villageId, combat } = payload;

    const village = await this.prisma.village.findUniqueOrThrow({
      where: { id: villageId },
    });

    const state = village.combatState || { outgoing: [], incoming: [] };

    state[combat.type] ??= [];
    state[combat.type].push(combat);

    await this.prisma.village.update({
      where: { id: villageId },
      data: { combatState: state },
    });
  }
  async getVillageDetails(villageId: string) {
    const village = await this.prisma.village.findUnique({
      where: { id: villageId },
      include: {
        troops: true,
      },
    });

    if (!village) throw new NotFoundException(`Village ${villageId} not found`);

    return {
      id: village.id,
      x: village.x,
      y: village.y,
      playerId: village.playerId,
      troops: village.troops.map((t) => ({
        troopType: t.troopType,
        quantity: t.quantity,
      })),
    };
  }

  async createArmyMovement(payload: {
    villageId: string;
    direction: 'incoming' | 'outgoing';
    battleId: string;
    originX: number;
    originY: number;
    targetX: number;
    targetY: number;
    troops: { troopType: string; quantity: number }[];
    arrivalTime: string;
  }) {
    await this.prisma.armyMovement.create({
      data: {
        villageId: payload.villageId,
        direction: payload.direction,
        battleId: payload.battleId,
        originX: payload.originX,
        originY: payload.originY,
        targetX: payload.targetX,
        targetY: payload.targetY,
        troops: payload.troops,
        arrivalTime: new Date(payload.arrivalTime),
      },
    });

    console.log(
      `✅ Movimento ${payload.direction} registado para vila ${payload.villageId}`,
    );
  }
  async validateBattleRequest(dto: AttackRequestDto) {
    const village = await this.getVillageDetails(dto.attackerVillageId);

    if (village.x !== dto.origin.x || village.y !== dto.origin.y) {
      throw new BadRequestException('Origem inválida');
    }

    for (const req of dto.troops) {
      const vTroop = village.troops.find((t) => t.troopType === req.troopType);
      if (!vTroop || vTroop.quantity < req.quantity) {
        throw new BadRequestException(`Tropas insuficientes: ${req.troopType}`);
      }
    }

    const validated: ValidatedBattlePayload = {
      attackerVillageId: dto.attackerVillageId,
      origin: dto.origin,
      target: dto.target,
      troops: dto.troops,
    };

    await this.kafka.emit('combat.battle.validated', validated);
    return { status: 'VALIDATED' };
  }
}
