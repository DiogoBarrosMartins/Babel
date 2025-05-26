import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BuildingType } from '@prisma/client';
import { v4 as uuid } from 'uuid';

export interface FinishBuildPayload {
  villageId: string;
  buildingId: string;
  type: BuildingType;
  targetLevel: number;
}

@Injectable()
export class ConstructionService {
  constructor(
    @InjectQueue('construction')
    private readonly constructionQueue: Queue,
  ) {}

  async queueBuild(
    villageId: string,
    type: BuildingType,
    currentLevel: number,
    buildTimeMs: number,
  ): Promise<string> {
    const buildingId = uuid();
    const targetLevel = currentLevel + 1;

    await this.constructionQueue.add(
      'finishBuild',
      { villageId, buildingId, type, targetLevel } as FinishBuildPayload,
      { delay: buildTimeMs, attempts: 3, backoff: 1000 },
    );

    return buildingId;
  }
}
