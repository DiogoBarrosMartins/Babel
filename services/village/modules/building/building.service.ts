import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuildingType } from '@prisma/client';
import { ConstructionService } from '../construction/construction.service';

import {
  BUILDING_COSTS,
  BUILD_TIMES_MS,
} from '../../../../libs/types/building-type';

import { ResourceService } from '../resource/resource.service';

@Injectable()
export class BuildingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceService: ResourceService,
    private readonly constructionService: ConstructionService,
  ) {}

  async startConstruction(villageId: string, type: BuildingType) {
    const existing = await this.prisma.building.findFirst({
      where: { villageId, type },
    });
    const currentLevel = existing?.level ?? 0;

    const cost = BUILDING_COSTS[type][currentLevel];
    const buildTimeMs = BUILD_TIMES_MS[type][currentLevel];

    this.resourceService.deductResources(villageId, cost);
    const buildingId = await this.constructionService.queueBuild(
      villageId,
      type,
      currentLevel,
      buildTimeMs,
    );

    await this.prisma.constructionTask.create({
      data: {
        villageId,
        buildingId,
        type,
        level: currentLevel + 1,
        status: 'in_progress',
        startTime: new Date(),
        endTime: new Date(Date.now() + buildTimeMs),
      },
    });

    return { buildingId, finishAt: new Date(Date.now() + buildTimeMs) };
  }
}
