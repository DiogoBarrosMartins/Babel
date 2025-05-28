import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrainingQueueService } from './training-queue.service';
import { TrainingService } from './training.service';
import { TrainingProcessor } from './training.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'training' }), PrismaModule],
  providers: [TrainingQueueService, TrainingService, TrainingProcessor],
  exports: [TrainingService],
})
export class TrainingModule {}
