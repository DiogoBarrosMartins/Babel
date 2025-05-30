import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { Resources } from '../../../../libs/types/resource-map';

@Injectable()
export class ResourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async getResources(villageId: string): Promise<Resources> {
    const village = await this.prisma.village.findUniqueOrThrow({
      where: { id: villageId },
      select: {
        resourceAmounts: true,
        resourceProductionRates: true,
        lastCollectedAt: true,
        createdAt: true,
      },
    });

    const amounts = village.resourceAmounts as Resources;
    const rates = village.resourceProductionRates as Resources;

    const now = new Date();
    const last = village.lastCollectedAt;
    const elapsedSec = Math.floor((now.getTime() - last.getTime()) / 1000);

    console.log(elapsedSec);

    const newResources: Resources = {
      food: amounts.food + elapsedSec * rates.food,
      wood: amounts.wood + elapsedSec * rates.wood,
      stone: amounts.stone + elapsedSec * rates.stone,
      gold: amounts.gold + elapsedSec * rates.gold,
    };

    await this.prisma.village.update({
      where: { id: villageId },
      data: {
        resourceAmounts: newResources,
        lastCollectedAt: now,
      },
    });

    await this.kafka.emit('village.resources.updated', {
      villageId,
      resourceAmounts: newResources,
      timestamp: now.toISOString(),
    });

    return newResources;
  }

  async deductResources(villageId: string, cost: Resources): Promise<void> {
    const resources = await this.getResources(villageId);

    for (const key of ['food', 'wood', 'stone', 'gold'] as const) {
      if (resources[key] < cost[key]) {
        throw new BadRequestException(
          `Insufficient resources: need ${cost[key]} ${key}, but have only ${resources[key]}.`,
        );
      }
    }

    const updated: Resources = {
      food: Math.max(resources.food - cost.food, 0),
      wood: Math.max(resources.wood - cost.wood, 0),
      stone: Math.max(resources.stone - cost.stone, 0),
      gold: Math.max(resources.gold - cost.gold, 0),
    };

    await this.prisma.village.update({
      where: { id: villageId },
      data: { resourceAmounts: updated },
    });

    await this.kafka.emit('village.resources.deducted', {
      villageId,
      cost,
      newResourceAmounts: updated,
    });
  }
}
