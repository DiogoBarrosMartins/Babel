import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CombatService } from '../modules/combat/combat.service';
import { AttackRequestDto } from '../modules/combat/dto/attack-request.dto';
import { ValidatedBattlePayload } from '../../../libs/types/combat-type';

@Controller()
export class KafkaController {
  constructor(private readonly combatService: CombatService) {
    console.log('[CombatController] Constructed');
  }

  @MessagePattern('combat.attack.initiate')
  async handleInitiateAttack(@Payload() dto: AttackRequestDto) {
    console.log('[CombatController] Received combat.attack.initiate', dto);
    const result = await this.combatService.initiateAttack(dto);
    console.log('[CombatController] initiateAttack result:', result);
    return result;
  }

  @MessagePattern('combat.battle.validated')
  async handleBattleValidated(@Payload() payload: ValidatedBattlePayload) {
    console.log('[CombatController] Received combat.battle.validated', payload);
    const result = await this.combatService.processValidatedBattle(payload);
    console.log('[CombatController] processValidatedBattle result:', result);
    return result;
  }
}
