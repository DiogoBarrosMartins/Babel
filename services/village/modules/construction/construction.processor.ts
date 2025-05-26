// services/village/modules/construction/construction.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FinishBuildPayload } from './construction.service';

@Processor('construction')
@Injectable()
export class ConstructionProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('finishBuild')
  async handleFinishBuild(job: Job<FinishBuildPayload>) {
    const { villageId, buildingId, type, targetLevel } = job.data;

    await this.prisma.building.upsert({
      where: { id: buildingId },
      update: { level: targetLevel, status: 'idle' },
      create: { id: buildingId, villageId, type, level: targetLevel },
    });

    await this.prisma.constructionTask.updateMany({
      where: { villageId, buildingId, status: 'in_progress' },
      data: { status: 'done' },
    });
  }
}
