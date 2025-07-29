import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('training')
export class TrainingProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('finishTraining')
  async handleFinishTraining(
    job: Job<{ taskId: string; buildTimeMs: number }>,
  ) {
    const { taskId, buildTimeMs } = job.data;

    const task = await this.prisma.trainingTask.findUniqueOrThrow({
      where: { id: taskId },
    });

    if (task.status !== 'in_progress') {
      console.warn(`[Processor] Task ${taskId} is not active. Skipping.`);
      return;
    }

    await this.prisma.troop.update({
      where: { id: task.troopId },
      data: { quantity: { increment: 1 } },
    });

    const remaining = task.remaining - 1;
    const updateData: any = { remaining };

    if (remaining <= 0) {
      updateData.status = 'completed';
    }

    await this.prisma.trainingTask.update({
      where: { id: taskId },
      data: updateData,
    });

    if (remaining > 0) {
      const jobNext = await job.queue.add(
        'finishTraining',
        { taskId, buildTimeMs },
        {
          delay: buildTimeMs,
          attempts: 3,
          backoff: { type: 'fixed', delay: 1000 },
        },
      );

      await this.prisma.trainingTask.update({
        where: { id: taskId },
        data: { queueJobId: jobNext.id.toString() },
      });

      return;
    }

    const nextTask = await this.prisma.trainingTask.findFirst({
      where: {
        villageId: task.villageId,
        buildingType: task.buildingType,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
    });

    if (nextTask) {
      const nextJob = await job.queue.add(
        'finishTraining',
        {
          taskId: nextTask.id,
          buildTimeMs,
        },
        {
          delay: buildTimeMs,
          attempts: 3,
          backoff: { type: 'fixed', delay: 1000 },
        },
      );

      await this.prisma.trainingTask.update({
        where: { id: nextTask.id },
        data: {
          status: 'in_progress',
          startTime: new Date(),
          queueJobId: nextJob.id.toString(),
        },
      });
    }
  }
}
