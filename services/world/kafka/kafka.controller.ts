import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorldService } from '../modules/world/world.service';

@Controller()
export class WorldKafkaController {
  constructor(private readonly worldService: WorldService) {}

  @MessagePattern('village.created')
  async handleVillageCreated(@Payload() message: any) {
    await this.worldService.addVillageToTile(message.value);
  }

  @MessagePattern('outpost.created')
  async handleOutpostCreated(@Payload() message: any) {
    await this.worldService.addOutpostToTile(message.value);
  }
}
