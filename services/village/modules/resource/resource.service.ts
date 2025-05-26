import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';

interface Resources extends Record<string, number> {
  wood: number;
  clay: number;
  iron: number;
  grain: number;
}

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

    const amounts = (village.resourceAmounts as Resources) ?? {
      wood: 0,
      clay: 0,
      iron: 0,
      grain: 0,
    };
    const rates = (village.resourceProductionRates as Resources) ?? {
      wood: 0,
      clay: 0,
      iron: 0,
      grain: 0,
    };

    const now = new Date();
    const last = village.lastCollectedAt;
    const elapsedSec = Math.floor((now.getTime() - last.getTime()) / 1000);

    console.log(elapsedSec);

    const newResources: Resources = {
      wood: amounts.wood + elapsedSec * rates.wood,
      clay: amounts.clay + elapsedSec * rates.clay,
      iron: amounts.iron + elapsedSec * rates.iron,
      grain: amounts.grain + elapsedSec * rates.grain,
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

  async deductResources(villageId: string, cost: any): Promise<void> {
    const village = await this.prisma.village.findUniqueOrThrow({
      where: { id: villageId },
      select: { resourceAmounts: true },
    });

    const currentResources = village.resourceAmounts as unknown as Resources;

    const newResources: Resources = {
      wood: Math.max(currentResources.wood - (cost.wood || 0), 0),
      clay: Math.max(currentResources.clay - (cost.clay || 0), 0),
      iron: Math.max(currentResources.iron - (cost.iron || 0), 0),
      grain: Math.max(currentResources.grain - (cost.grain || 0), 0),
    };

    await this.prisma.village.update({
      where: { id: villageId },
      data: { resourceAmounts: newResources },
    });

    await this.kafka.emit('village.resources.deducted', {
      villageId,
      cost,
      newResourceAmounts: newResources,
    });
  }
}
