import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingQueueService } from './training-queue.service';

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
  ): Promise<{ taskId: string; finishAt: Date }> {
    const finishAt = new Date(Date.now() + unitTimeMs * count);

    const task = await this.prisma.trainingTask.create({
      data: {
        villageId,
        troopId,
        troopType,
        count,
        remaining: count,
        status: 'in_progress',
        startTime: new Date(),
        endTime: finishAt,
        queueJobId: '',
      },
    });

    const job = await this.trainingQueue.queueTraining(
      { taskId: task.id, buildTimeMs: unitTimeMs },
      unitTimeMs,
    );

    await this.prisma.trainingTask.update({
      where: { id: task.id },
      data: { queueJobId: job.id.toString() },
    });

    return { taskId: task.id, finishAt };
  }
}
