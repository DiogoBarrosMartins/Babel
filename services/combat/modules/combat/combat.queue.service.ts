import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

export interface ResolveBattlePayload {
  battleId: string;
}

@Injectable()
export class CombatQueueService {
  constructor(
    @InjectQueue('combat')
    private readonly combatQueue: Queue,
  ) {}

  async queueBattleResolution(
    payload: ResolveBattlePayload,
    delayMs: number,
  ): Promise<Job> {
    return this.combatQueue.add('resolveBattle', payload, {
      delay: delayMs,
      attempts: 3,
      backoff: { type: 'fixed', delay: 1000 },
    });
  }
}
