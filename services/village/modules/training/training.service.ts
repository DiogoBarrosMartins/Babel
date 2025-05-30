import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrainingQueueService } from './training-queue.service';
import { BuildingType } from '@prisma/client';

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
    buildingType: BuildingType,
    count: number,
    unitTimeMs: number,
  ): Promise<{ taskId: string; finishAt: Date }> {
    const existingTask = await this.prisma.trainingTask.findFirst({
      where: {
        villageId,
        buildingType,
        status: 'in_progress',
      },
    });

    const endTime = new Date(Date.now() + count * unitTimeMs);

    const data: any = {
      troopType,
      troopId,
      villageId,
      count,
      remaining: count,
      status: existingTask ? 'pending' : 'in_progress',
      endTime,
      queueJobId: '',
      buildingType,
    };

    if (!existingTask) {
      data.startTime = new Date();
    }

    const task = await this.prisma.trainingTask.create({ data });

    if (!existingTask) {
      const job = await this.trainingQueue.queueTraining(
        { taskId: task.id, buildTimeMs: unitTimeMs },
        unitTimeMs,
      );

      await this.prisma.trainingTask.update({
        where: { id: task.id },
        data: { queueJobId: job.id.toString() },
      });
    }

    return { taskId: task.id, finishAt: endTime };
  }

  async cancelTraining(taskId: string) {
    const task = await this.prisma.trainingTask.findUniqueOrThrow({
      where: { id: taskId },
    });

    if (task.status === 'completed')
      throw new Error('Cannot cancel completed task');

    await this.prisma.trainingTask.delete({ where: { id: taskId } });

    if (task.status === 'in_progress') {
      const next = await this.prisma.trainingTask.findFirst({
        where: {
          villageId: task.villageId,
          buildingType: task.buildingType,
          status: 'pending',
        },
        orderBy: { createdAt: 'asc' },
      });

      if (next) {
        const buildTimeMs =
          (task.endTime.getTime() - task.startTime.getTime()) / task.count;

        await this.prisma.trainingTask.update({
          where: { id: next.id },
          data: {
            status: 'in_progress',
            startTime: new Date(),
          },
        });

        const job = await this.trainingQueue.queueTraining(
          { taskId: next.id, buildTimeMs },
          buildTimeMs,
        );

        await this.prisma.trainingTask.update({
          where: { id: next.id },
          data: { queueJobId: job.id.toString() },
        });
      }
    }
  }
}
