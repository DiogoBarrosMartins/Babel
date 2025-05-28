// services/village/src/modules/training/training.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrainingQueueService } from './training-queue.service';
import { TrainingService } from './training.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'training' }), PrismaModule],
  providers: [TrainingQueueService, TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
