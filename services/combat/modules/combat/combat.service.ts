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
  ) {
    console.log('[CombatService] Constructed');
  }

  async initiateAttack(dto: AttackRequestDto) {
    console.log('[CombatService] [initiateAttack] Started with DTO:', dto);
    await this.kafka.emit('combat.battle.requested', dto);
    console.log(
      '[CombatService] [initiateAttack] Emitted combat.battle.requested',
    );
    return { status: 'REQUEST_EMITTED' };
  }

  async processValidatedBattle(payload: ValidatedBattlePayload) {
    console.log(
      '[CombatService] [processValidatedBattle] Started with payload:',
      payload,
    );
    const { attackerVillageId, origin, target, troops } = payload;

    const dx = target.x - origin.x;
    const dy = target.y - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    console.log(
      '[CombatService] [processValidatedBattle] Calculated distance:',
      distance,
    );

    const troopSpeeds = troops.map((t) => TROOP_TYPES[t.troopType].speed);
    const slowestSpeed = Math.min(...troopSpeeds);
    console.log(
      '[CombatService] [processValidatedBattle] Calculated slowest troop speed:',
      slowestSpeed,
    );

    const travelSeconds = distance / slowestSpeed;
    console.log(
      '[CombatService] [processValidatedBattle] Calculated travel time (s):',
      travelSeconds,
    );

    const now = new Date();
    const arrivalTime = addSeconds(now, travelSeconds);
    console.log(
      '[CombatService] [processValidatedBattle] Arrival time calculated as:',
      arrivalTime,
    );

    // 🔍 Procurar vila defensora pelas coordenadas
    const defenderVillage = await this.prisma.village.findFirst({
      where: {
        x: target.x,
        y: target.y,
      },
    });
    console.log(
      '[CombatService] [processValidatedBattle] Defender village lookup result:',
      defenderVillage,
    );

    if (!defenderVillage) {
      console.warn(
        `[CombatService] [processValidatedBattle] No defender village at (${target.x}, ${target.y})`,
      );
      throw new Error('No defender village found at target coordinates');
    }

    console.log(
      '[CombatService] [processValidatedBattle] Creating battle in DB',
    );
    const createdBattle = await this.prisma.battle.create({
      data: {
        attackerVillageId,
        defenderVillageId: defenderVillage.id,
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
    console.log(
      '[CombatService] [processValidatedBattle] Battle created with ID:',
      battleId,
    );

    await this.kafka.emit('village.troops.reserve', {
      villageId: attackerVillageId,
      troops,
      reason: `battle:${battleId}`,
    });
    console.log(
      '[CombatService] [processValidatedBattle] Emitted village.troops.reserve',
    );

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
    console.log(
      '[CombatService] [processValidatedBattle] Emitted village.movement.create',
    );

    await this.combatQueue.queueBattleResolution(
      { battleId },
      differenceInMilliseconds(arrivalTime, now),
    );
    console.log(
      '[CombatService] [processValidatedBattle] Battle resolution queued',
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
    console.log(
      '[CombatService] [processValidatedBattle] Emitted village.combat.updated for attacker',
    );

    await this.kafka.emit('village.combat.updated', {
      coords: { x: target.x, y: target.y },
      combat: { type: 'incoming', ...baseCombatData },
    });
    console.log(
      '[CombatService] [processValidatedBattle] Emitted village.combat.updated for defender',
    );

    return { battleId, arrivalTime };
  }

  resolveBattle(battleId: string) {
    console.log(
      '[CombatService] [resolveBattle] Resolving battle with ID:',
      battleId,
    );
  }
}
