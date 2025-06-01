import { Module } from '@nestjs/common';
import { CombatService } from './combat.service';
import { CombatController } from './combat.controller';

@Module({
  controllers: [CombatController],
  providers: [CombatService],
})
export class CombatModule {}
