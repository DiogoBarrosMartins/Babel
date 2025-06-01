import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CombatService } from './combat.service';
import { AttackRequestDto } from './dto/attack-request.dto';

@Controller()
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  @MessagePattern('combat.attack.requested')
  async handleAttackRequested(@Payload() payload: AttackRequestDto) {
    console.log('⚔️ Attack requested:', payload);
    return this.combatService.registerBattle(payload);
  }
}
