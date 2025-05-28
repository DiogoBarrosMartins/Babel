import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TrainingQueueService,
  FinishTrainingPayload,
} from './training-queue.service';

@Injectable()
export class TrainingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingQueue: TrainingQueueService,
  ) {}

  async startTraining(
    villageId: string,
    troopId: string,
    troopType: string,
    count: number,
    unitTimeMs: number,
  ): Promise<Array<{ taskId: string; finishAt: Date }>> {
    const tasks: Array<{ taskId: string; finishAt: Date }> = [];
    let lastFinishAt: Date | null = null;

    for (let i = 0; i < count; i++) {
      const delay = unitTimeMs * (i + 1);
      const finishAt = new Date(Date.now() + delay);

      const payload: FinishTrainingPayload = {
        villageId,
        troopId,
        troopType,
        count: 1,
      };
      const job = await this.trainingQueue.queueTraining(payload, delay);

      const task = await this.prisma.trainingTask.create({
        data: {
          villageId,
          troopId,
          troopType,
          count: 1,
          status: 'in_progress',
          startTime: new Date(),
          endTime: finishAt,
          queueJobId: job.id.toString(),
        },
      });

      tasks.push({ taskId: task.id, finishAt });
      lastFinishAt = finishAt;
    }

    if (lastFinishAt) {
      await this.prisma.troop.update({
        where: { id: troopId },
        data: { status: 'queued', queuedUntil: lastFinishAt },
      });
    }

    return tasks;
  }
}
