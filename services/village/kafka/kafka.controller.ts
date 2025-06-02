import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VillageService } from '../modules/village/village.service';
import { CreateVillageDto } from '../modules/village/dto/create-village.dto';

@Controller()
export class KafkaController {
  constructor(private readonly svc: VillageService) {
    console.log('[KafkaController] Constructed');
  }

  @MessagePattern('player.created')
  handlePlayerCreated(@Payload() payload: CreateVillageDto) {
    console.log('[KafkaController] Received player.created', payload);
    const result = this.svc.create(payload);
    console.log('[KafkaController] create result:', result);
    return result;
  }

  @MessagePattern('player.allocated')
  async handleTileAllocated(@Payload() payload: any) {
    console.log('[KafkaController] Received player.allocated', payload);
    const result = await this.svc.handleTileAllocated(payload);
    console.log('[KafkaController] handleTileAllocated result:', result);
    return result;
  }

  @MessagePattern('village.combat.updated')
  async handleCombatUpdated(@Payload() payload: any) {
    console.log('[KafkaController] Received village.combat.updated', payload);
    const result = await this.svc.handleCombatUpdate(payload);
    console.log('[KafkaController] handleCombatUpdate result:', result);
    return result;
  }

  @MessagePattern('village.get.details')
  async handleGetVillageDetails(@Payload() villageId: string) {
    console.log('[KafkaController] Received village.get.details', villageId);
    const result = await this.svc.getVillageDetails(villageId);
    console.log('[KafkaController] getVillageDetails result:', result);
    return result;
  }

  @MessagePattern('village.movement.create')
  async handleCreateArmyMovement(
    @Payload()
    payload: {
      villageId: string;
      direction: 'incoming' | 'outgoing';
      battleId: string;
      originX: number;
      originY: number;
      targetX: number;
      targetY: number;
      troops: { troopType: string; quantity: number }[];
      arrivalTime: string;
    },
  ) {
    console.log('[KafkaController] Received village.movement.create', payload);
    const result = await this.svc.createArmyMovement(payload);
    console.log('[KafkaController] createArmyMovement result:', result);
    return result;
  }

  @MessagePattern('combat.battle.requested')
  async handleBattleRequest(@Payload() dto: any) {
    console.log('[KafkaController] Received combat.battle.requested', dto);
    const result = await this.svc.validateBattleRequest(dto);
    console.log('[KafkaController] validateBattleRequest result:', result);
    return result;
  }
}
