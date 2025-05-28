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

    // 1. Load the batch task
    const task = await this.prisma.trainingTask.findUniqueOrThrow({
      where: { id: taskId },
    });

    // 2. Grant one unit to the troop
    await this.prisma.troop.update({
      where: { id: task.troopId },
      data: { quantity: { increment: 1 } },
    });

    // 3. Decrement remaining count
    const remaining = task.remaining - 1;
    const updateData: any = { remaining };
    if (remaining <= 0) {
      updateData.status = 'completed';
    }
    await this.prisma.trainingTask.update({
      where: { id: taskId },
      data: updateData,
    });

    // 4. Re-enqueue if more remain
    if (remaining > 0) {
      await job.queue.add(
        'finishTraining',
        { taskId, buildTimeMs },
        {
          delay: buildTimeMs,
          attempts: 3,
          backoff: { type: 'fixed', delay: 1000 },
        },
      );
    }
  }
}
