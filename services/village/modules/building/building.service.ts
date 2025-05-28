import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuildingType } from '@prisma/client';
import { ConstructionService } from '../construction/construction.service';
import { ResourceService } from '../resource/resource.service';
import {
  BUILDING_COSTS,
  BUILD_TIMES_MS,
} from '../../../../libs/types/building-type';
import { BUILDING_NAMES } from '../../../../libs/types/building-name';
import { Resources } from '../../../../libs/types/resource-map';

@Injectable()
export class BuildingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resourceService: ResourceService,
    private readonly constructionService: ConstructionService,
  ) {}

  async initializeBuildingsForVillage(villageId: string, race: string) {
    const buildingTypes = Object.values(BuildingType);

    const buildings = buildingTypes.map((type) => ({
      villageId,
      type,
      level: 0,
      status: 'idle',
      name: BUILDING_NAMES[race][type],
    }));

    await this.prisma.building.createMany({ data: buildings });
  }

  async upgradeBuilding(villageId: string, type: BuildingType) {
    const existing = await this.prisma.building.findFirst({
      where: { villageId, type },
    });
    if (!existing) {
      throw new BadRequestException(
        `Building ${type} not found in village ${villageId}`,
      );
    }

    const currentLevel = existing.level;
    const costDef = BUILDING_COSTS[type][currentLevel];
    const buildTimeMs = BUILD_TIMES_MS[type][currentLevel];
    const finishAt = new Date(Date.now() + buildTimeMs);

    const resourceCost: Resources = {
      food: costDef.food,
      wood: costDef.wood,
      stone: costDef.stone,
      gold: costDef.gold,
    };
    await this.resourceService.deductResources(villageId, resourceCost);

    await this.constructionService.queueBuild(
      villageId,
      existing.id,
      type,
      currentLevel,
      buildTimeMs,
    );

    await this.prisma.constructionTask.create({
      data: {
        villageId,
        buildingId: existing.id,
        type,
        level: currentLevel + 1,
        status: 'in_progress',
        startTime: new Date(),
        endTime: finishAt,
      },
    });

    await this.prisma.building.update({
      where: { id: existing.id },
      data: {
        status: 'queued',
        queuedUntil: finishAt,
      },
    });

    return {
      buildingId: existing.id,
      finishAt,
    };
  }
}
