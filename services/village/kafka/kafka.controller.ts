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
}
