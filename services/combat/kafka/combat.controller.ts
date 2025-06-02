import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CombatService } from '../modules/combat/combat.service';
import { AttackRequestDto } from '../modules/combat/dto/attack-request.dto';
import { ValidatedBattlePayload } from '../../../libs/types/combat-type';

@Controller()
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  @MessagePattern('combat.attack.initiate')
  async handleInitiateAttack(@Payload() dto: AttackRequestDto) {
    return this.combatService.initiateAttack(dto);
  }

  @MessagePattern('combat.battle.validated')
  async handleBattleValidated(@Payload() payload: ValidatedBattlePayload) {
    return this.combatService.processValidatedBattle(payload);
  }
}
