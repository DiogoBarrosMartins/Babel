import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CombatService } from '../modules/combat/combat.service';
import { AttackRequestDto } from '../modules/combat/dto/attack-request.dto';

@Controller()
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  @MessagePattern('combat.attack.requested')
  async handleAttackRequested(@Payload() payload: AttackRequestDto) {
    console.log('⚔️ Attack requested:', payload);
    return this.combatService.registerBattle(payload);
  }
  @MessagePattern('combat.battles.forVillage')
  async handleGetBattlesForVillage(@Payload() villageId: string) {
    return this.combatService.getBattlesForVillage(villageId);
  }
}
