import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';

interface Resources extends Record<string, number> {
  wood: number;
  clay: number;
  iron: number;
  crop: number;
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

    const amounts = (village.resourceAmounts as unknown as Resources) ?? {
      wood: 0,
      clay: 0,
      iron: 0,
      crop: 0,
    };
    const rates = (village.resourceProductionRates as unknown as Resources) ?? {
      wood: 0,
      clay: 0,
      iron: 0,
      crop: 0,
    };

    const now = new Date();
    const last = village.lastCollectedAt;
    const elapsedSec = Math.floor((now.getTime() - last.getTime()) / 1000);

    const newResources: Resources = {
      wood: Math.min(amounts.wood + elapsedSec * (rates.wood / 3600), 800),
      clay: Math.min(amounts.clay + elapsedSec * (rates.clay / 3600), 800),
      iron: Math.min(amounts.iron + elapsedSec * (rates.iron / 3600), 800),
      crop: Math.min(amounts.crop + elapsedSec * (rates.crop / 3600), 800),
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
}
