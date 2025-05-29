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

    const activeTask = await this.prisma.trainingTask.findFirst({
      where: {
        troopId,
        status: 'in_progress',
      },
    });

    const task = await this.prisma.trainingTask.create({
      data: {
        villageId,
        troopId,
        troopType,
        count,
        remaining: count,
        status: activeTask ? 'pending' : 'in_progress',
        startTime: activeTask ? null : new Date(),
        endTime: finishAt,
        queueJobId: '',
      },
    });

    if (!activeTask) {
      const job = await this.trainingQueue.queueTraining(
        { taskId: task.id, buildTimeMs: unitTimeMs },
        unitTimeMs,
      );

      await this.prisma.trainingTask.update({
        where: { id: task.id },
        data: { queueJobId: job.id.toString() },
      });
    }

    return { taskId: task.id, finishAt };
  }
}
