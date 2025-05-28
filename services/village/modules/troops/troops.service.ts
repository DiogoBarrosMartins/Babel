// services/village/src/modules/troops/troops.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourceService } from '../resource/resource.service';
import { TrainingService } from '../training/training.service';
import { TROOP_TYPES } from '../../../../libs/types/troop-types';

@Injectable()
export class TroopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceService: ResourceService,
    private readonly trainingService: TrainingService,
  ) {}

  async trainTroops(villageId: string, troopType: string, count: number) {
    const def = TROOP_TYPES[troopType];
    if (!def) throw new Error(`Troop type "${troopType}" inválido`);

    // 1) garante que existe o registro de Troop
    const troop = await this.prisma.troop.upsert({
      where: { villageId_troopType: { villageId, troopType } },
      create: {
        villageId,
        troopType,
        quantity: 0,
        status: 'idle',
        queuedUntil: null,
      },
      update: {},
    });

    // 2) deduz recursos de uma só vez
    const totalCost = {
      food: def.cost.food * count,
      wood: def.cost.wood * count,
      stone: def.cost.stone * count,
      gold: def.cost.gold * count,
    };
    await this.resourceService.deductResources(villageId, totalCost);

    // 3) agenda N jobs unitários
    const unitTimeMs = def.buildTime * 1000;
    return this.trainingService.startTraining(
      villageId,
      troop.id,
      troopType,
      count,
      unitTimeMs,
    );
  }
}
