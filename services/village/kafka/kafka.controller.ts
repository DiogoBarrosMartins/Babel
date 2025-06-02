import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VillageService } from '../modules/village/village.service';
import { CreateVillageDto } from '../modules/village/dto/create-village.dto';

@Controller()
export class KafkaController {
  constructor(private readonly svc: VillageService) {}

  @MessagePattern('player.created')
  handlePlayerCreated(@Payload() payload: CreateVillageDto) {
    console.log('Player created event received:', payload);
    return this.svc.create(payload);
  }

  @MessagePattern('player.allocated')
  async handleTileAllocated(@Payload() payload: any) {
    console.log('Player created event received:', payload);
    return this.svc.handleTileAllocated(payload);
  }
  @MessagePattern('village.combat.updated')
  async handleCombatUpdated(@Payload() payload: any) {
    return this.svc.handleCombatUpdate(payload);
  }
  @MessagePattern('village.get.details')
  async handleGetVillageDetails(@Payload() villageId: string) {
    return this.svc.getVillageDetails(villageId);
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
    return this.svc.createArmyMovement(payload);
  }
  @MessagePattern('combat.battle.requested')
  async handleBattleRequest(@Payload() dto: any) {
    return this.svc.validateBattleRequest(dto);
  }
}
