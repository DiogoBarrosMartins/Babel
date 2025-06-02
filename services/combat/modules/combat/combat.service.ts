import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { CombatQueueService } from './combat.queue.service';
import { TROOP_TYPES } from '../../../../libs/types/troop-types';
import { ValidatedBattlePayload } from '../../../../libs/types/combat-type';
import { addSeconds, differenceInMilliseconds } from 'date-fns';
import { AttackRequestDto } from './dto/attack-request.dto';

@Injectable()
export class CombatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly combatQueue: CombatQueueService,
  ) {}
  async initiateAttack(dto: AttackRequestDto) {
    await this.kafka.emit('combat.battle.requested', dto);
    return { status: 'REQUEST_EMITTED' };
  }

  async processValidatedBattle(payload: ValidatedBattlePayload) {
    const { attackerVillageId, origin, target, troops } = payload;

    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const troopSpeeds = troops.map((t) => TROOP_TYPES[t.troopType].speed);
    const slowestSpeed = Math.min(...troopSpeeds);
    const travelSeconds = distance / slowestSpeed;

    const now = new Date();
    const arrivalTime = addSeconds(now, travelSeconds);

    const createdBattle = await this.prisma.battle.create({
      data: {
        attackerVillageId,
        originX: origin.x,
        originY: origin.y,
        targetX: target.x,
        targetY: target.y,
        troops,
        startTime: now,
        arrivalTime,
        status: 'PENDING',
      },
    });

    const battleId = createdBattle.id;

    await this.kafka.emit('village.troops.reserve', {
      villageId: attackerVillageId,
      troops,
      reason: `battle:${battleId}`,
    });

    await this.kafka.emit('village.movement.create', {
      villageId: attackerVillageId,
      direction: 'outgoing',
      battleId,
      originX: origin.x,
      originY: origin.y,
      targetX: target.x,
      targetY: target.y,
      troops,
      arrivalTime: arrivalTime.toISOString(),
    });

    await this.combatQueue.queueBattleResolution(
      { battleId },
      differenceInMilliseconds(arrivalTime, now),
    );

    const baseCombatData = {
      id: battleId,
      originX: origin.x,
      originY: origin.y,
      targetX: target.x,
      targetY: target.y,
      startTime: now,
      arrivalTime,
      troops,
    };

    await this.kafka.emit('village.combat.updated', {
      villageId: attackerVillageId,
      combat: { type: 'outgoing', ...baseCombatData },
    });

    await this.kafka.emit('village.combat.updated', {
      coords: { x: target.x, y: target.y },
      combat: { type: 'incoming', ...baseCombatData },
    });

    return { battleId, arrivalTime };
  }
  resolveBattle(battleId: string) {
    console.log(' battle created with id ' + battleId);
  }
}
