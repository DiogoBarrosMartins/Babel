import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { CombatService } from './combat.service';

@Processor('combat')
export class CombatProcessor {
  constructor(private readonly combatService: CombatService) {}

  @Process('resolveBattle')
  async handleResolveBattle(job: Job<{ battleId: string }>) {
    return this.combatService.resolveBattle(job.data.battleId);
  }
}
