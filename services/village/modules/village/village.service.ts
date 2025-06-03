import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVillageDto } from './dto/create-village.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
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
  ) {
    console.log('[VillageService] Constructed');
  }

  async create(dto: CreateVillageDto) {
    console.log('[VillageService] Creating village with DTO:', dto);

    await this.kafka.emit('world.village-tile.requested', {
      race: dto.race,
      playerId: dto.playerId,
      playerName: dto.playerName,
      name: dto.name,
    });

    console.log('[VillageService] Emitted world.village-tile.requested');
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
    console.log('[VillageService] Handling tile allocation:', data);
    const existingVillage = await this.prisma.village.findFirst({
      where: {
        playerId: data.playerId,
        x: data.x,
        y: data.y,
      },
    });

    if (existingVillage) {
      console.warn('[VillageService] Village already exists:', existingVillage);
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

    console.log('[VillageService] Village created in DB:', village);

    await this.buildingService.initializeBuildingsForVillage(
      village.id,
      data.race,
    );
    console.log('[VillageService] Buildings initialized');

    await this.kafka.emit('village.created', {
      id: village.id,
      name: village.name,
      playerId: village.playerId,
      x: village.x,
      y: village.y,
    });
    console.log('[VillageService] Emitted village.created');

    return village;
  }

  findAll() {
    console.log('[VillageService] findAll called');
    return this.prisma.village.findMany();
  }

  async findByPlayer(playerId: string): Promise<Village[]> {
    console.log('[VillageService] Finding villages for player:', playerId);
    const villages = await this.prisma.village.findMany({
      where: { playerId },
    });
    if (villages.length === 0) {
      console.warn('[VillageService] No villages found for player:', playerId);
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
    console.log('[VillageService] Removing village with ID:', id);
    await this.prisma.village.delete({ where: { id } });
    await this.kafka.emit('village.deleted', { id });
    console.log('[VillageService] Emitted village.deleted');
    return { message: `Village ${id} deleted` };
  }

  async handleCombatUpdate(payload: {
    villageId?: string;
    coords?: { x: number; y: number };
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
    console.log('[VillageService] Handling combat update:', payload);
    const { villageId, coords, combat } = payload;

    const village = villageId
      ? await this.prisma.village.findUniqueOrThrow({
          where: { id: villageId },
        })
      : await this.prisma.village.findFirstOrThrow({
          where: { x: coords.x, y: coords.y },
        });

    const state = village.combatState || { outgoing: [], incoming: [] };

    if (combat.type === 'incoming') {
      delete combat.troops;
    }

    state[combat.type] ??= [];
    state[combat.type].push(combat);

    await this.prisma.village.update({
      where: { id: village.id },
      data: { combatState: state },
    });

    console.log(
      `[VillageService] Combat state updated for ${combat.type} village`,
      village.id,
    );
  }

  async getVillageDetails(villageId: string) {
    console.log('[VillageService] Fetching village details for ID:', villageId);
    const village = await this.prisma.village.findUnique({
      where: { id: villageId },
      include: {
        troops: true,
      },
    });

    if (!village) {
      console.warn('[VillageService] Village not found:', villageId);
      throw new NotFoundException(`Village ${villageId} not found`);
    }

    console.log('[VillageService] Returning village details:', village);
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
    console.log('[VillageService] Creating army movement:', payload);
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
      `✅ Movement ${payload.direction} Registered for village ${payload.villageId}`,
    );
  }

  async validateBattleRequest(dto: AttackRequestDto) {
    console.log('[VillageService] Validating battle request:', dto);

    const village = await this.getVillageDetails(dto.attackerVillageId);

    if (village.x !== dto.origin.x || village.y !== dto.origin.y) {
      console.warn('[VillageService] Invalid origin coordinates');
      throw new BadRequestException('Invalid Origin');
    }

    for (const req of dto.troops) {
      const vTroop = village.troops.find((t) => t.troopType === req.troopType);
      if (!vTroop || vTroop.quantity < req.quantity) {
        console.warn('[VillageService] Insuficient Troops:', req);
        throw new BadRequestException(`Insuficient Troops: ${req.troopType}`);
      }
    }

    await this.reserveTroopsForBattle(dto.attackerVillageId, dto.troops);

    const targetVillage = await this.prisma.village.findFirst({
      where: { x: dto.target.x, y: dto.target.y },
    });

    const validated: ValidatedBattlePayload = {
      attackerVillageId: dto.attackerVillageId,
      origin: dto.origin,
      target: dto.target,
      troops: dto.troops,
      defenderVillageId: targetVillage.id,
    };

    await this.kafka.emit('combat.battle.validated', validated);
    console.log('[VillageService] Emitted combat.battle.validated');

    return { status: 'VALIDATED' };
  }
  private async reserveTroopsForBattle(
    villageId: string,
    troops: { troopType: string; quantity: number }[],
  ) {
    console.log('[VillageService] Reserving troops for battle:', {
      villageId,
      troops,
    });

    for (const req of troops) {
      await this.prisma.troop.updateMany({
        where: {
          villageId,
          troopType: req.troopType,
          status: 'idle',
        },
        data: {
          quantity: { decrement: req.quantity },
        },
      });

      const existing = await this.prisma.troop.findFirst({
        where: {
          villageId,
          troopType: req.troopType,
          status: 'on_route',
        },
      });

      if (existing) {
        await this.prisma.troop.update({
          where: { id: existing.id },
          data: {
            quantity: { increment: req.quantity },
          },
        });
      } else {
        await this.prisma.troop.create({
          data: {
            villageId,
            troopType: req.troopType,
            quantity: req.quantity,
            status: 'on_route',
          },
        });
      }
    }
  }
}
