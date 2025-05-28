import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { FinishTrainingPayload } from './training-queue.service';

@Processor('training')
export class TrainingProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('finishTraining')
  async handleFinishTraining(job: Job<FinishTrainingPayload>) {
    const { troopId, count } = job.data;
    const jobId = job.id.toString();

    await this.prisma.troop.update({
      where: { id: troopId },
      data: {
        quantity: { increment: count },
      },
    });

    await this.prisma.trainingTask.updateMany({
      where: { queueJobId: jobId },
      data: { status: 'completed' },
    });

    const nextTask = await this.prisma.trainingTask.findFirst({
      where: {
        troopId,
        status: 'in_progress',
      },
      orderBy: {
        endTime: 'asc',
      },
      select: {
        endTime: true,
      },
    });

    if (nextTask) {
      await this.prisma.troop.update({
        where: { id: troopId },
        data: {
          status: 'queued',
          queuedUntil: nextTask.endTime,
        },
      });
    } else {
      await this.prisma.troop.update({
        where: { id: troopId },
        data: {
          status: 'idle',
          queuedUntil: null,
        },
      });
    }
  }
}
