import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

export interface FinishTrainingPayload {
  villageId: string;
  troopId: string;
  troopType: string;
  count: number;
}

@Injectable()
export class TrainingQueueService {
  constructor(
    @InjectQueue('training')
    private readonly trainingQueue: Queue,
  ) {}

  async queueTraining(
    payload: FinishTrainingPayload,
    delayMs: number,
  ): Promise<Job> {
    return this.trainingQueue.add('finishTraining', payload, {
      delay: delayMs,
      attempts: 3,
      backoff: { type: 'fixed', delay: 1000 },
    });
  }
}
