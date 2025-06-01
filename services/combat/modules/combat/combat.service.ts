import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AttackRequestDto } from './dto/attack-request.dto';
import {
  BattleReportPayload,
  CombatLoot,
  CombatTroopLoss,
} from '../../../../libs/types/combat-type';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { CombatQueueService } from './combat.queue.service';

@Injectable()
export class CombatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
    private readonly combatQueue: CombatQueueService,
  ) {}

  async getBattlesForVillage(villageId: string) {
    const battles = await this.prisma.battle.findMany({
      where: {
        OR: [
          { attackerVillageId: villageId },
          { defenderVillageId: villageId },
        ],
        status: 'PENDING',
      },
    });

    return {
      outgoing: battles.filter((b) => b.attackerVillageId === villageId),
      incoming: battles.filter((b) => b.defenderVillageId === villageId),
    };
  }

  async registerBattle(dto: AttackRequestDto) {
    await this.prisma.battle.create({
      data: {
        id: dto.battleId,
        attackerVillageId: dto.attackerVillageId,
        originX: dto.origin.x,
        originY: dto.origin.y,
        targetX: dto.target.x,
        targetY: dto.target.y,
        troops: dto.troops,
        startTime: new Date(dto.startTime),
        arrivalTime: new Date(dto.arrivalTime),
        status: 'PENDING',
      },
    });

    await this.combatQueue.queueBattleResolution(
      { battleId: dto.battleId },
      new Date(dto.arrivalTime).getTime() - Date.now(),
    );

    const baseCombatData = {
      id: dto.battleId,
      originX: dto.origin.x,
      originY: dto.origin.y,
      targetX: dto.target.x,
      targetY: dto.target.y,
      startTime: dto.startTime,
      arrivalTime: dto.arrivalTime,
      troops: dto.troops,
    };

    await this.kafka.emit('village.combat.updated', {
      villageId: dto.attackerVillageId,
      combat: { type: 'outgoing', ...baseCombatData },
    });

    await this.kafka.emit('village.combat.updated', {
      coords: { x: dto.target.x, y: dto.target.y },
      combat: { type: 'incoming', ...baseCombatData },
    });
  }

  async resolveBattle(battleId: string) {
    const battle = await this.prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle || battle.status !== 'PENDING') return;

    const attackerTroops = battle.troops as {
      troopType: string;
      quantity: number;
    }[];

    const attackerLosses: CombatTroopLoss[] = attackerTroops.map((t) => ({
      troopType: t.troopType,
      lost: Math.floor(t.quantity * 0.3),
      remaining: Math.ceil(t.quantity * 0.7),
    }));

    const defenderLosses: CombatTroopLoss[] = [
      { troopType: 'npc_defender', lost: 20, remaining: 0 },
    ];

    const loot: CombatLoot = {
      food: 120,
      wood: 80,
      stone: 50,
      gold: 60,
    };

    const report: BattleReportPayload = {
      battleId: battle.id,
      outcome: 'VICTORY',
      attackerLosses,
      defenderLosses,
      loot,
    };

    await this.prisma.battleReport.create({
      data: {
        battleId: battle.id,
        outcome: report.outcome,
        attackerLosses: JSON.stringify(report.attackerLosses),
        defenderLosses: JSON.stringify(report.defenderLosses),
        loot: JSON.stringify(report.loot),
        notes: report.notes ?? '',
      },
    });

    await this.prisma.battle.update({
      where: { id: battle.id },
      data: { status: 'RESOLVED' },
    });

    // TODO: Emitir evento Kafka com resultado final da batalha
  }
}
