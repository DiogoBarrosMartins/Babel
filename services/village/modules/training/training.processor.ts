// services/village/src/modules/training/training.processor.ts
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

    await this.prisma.troop.update({
      where: { id: troopId },
      data: { quantity: { increment: count } },
    });

    await this.prisma.trainingTask.updateMany({
      where: { queueJobId: job.id.toString() },
      data: { status: 'completed' },
    });
  }
}
