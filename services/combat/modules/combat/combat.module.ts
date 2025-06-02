// combat.module.ts
import { Module } from '@nestjs/common';
import { CombatService } from './combat.service';
import { CombatQueueService } from './combat.queue.service';
import { CombatProcessor } from './combat.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';
import { BullModule } from '@nestjs/bull';
import { CombatController } from '../../modules/combat/combat.controller';

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    BullModule.registerQueue({
      name: 'combat',
    }),
  ],
  controllers: [CombatController],
  providers: [CombatService, CombatQueueService, CombatProcessor],
  exports: [CombatService],
})
export class CombatModule {}
