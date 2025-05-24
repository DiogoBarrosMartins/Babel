import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VillageService } from '../modules/village/village.service';

@Controller()
export class KafkaController {
  constructor(private readonly svc: VillageService) {}

  @MessagePattern('player.created')
  handlePlayerCreated(@Payload() message: any) {
    return this.svc.create(message.value);
  }
}
