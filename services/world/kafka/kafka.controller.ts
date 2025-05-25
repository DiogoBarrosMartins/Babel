import { Controller } from '@nestjs/common';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import { WorldService } from '../modules/world/world.service';

@Controller()
export class KafkaController {
  constructor(private readonly svc: WorldService) {}

  @MessagePattern('world.village-tile.requested')
  handleVillageTileRequest(
    @Payload() payload: any,
    @Ctx() context: KafkaContext,
  ) {
    console.log('📨 Kafka payload raw:', context.getMessage().value.toString());
    console.log('✅ Parsed payload:', payload);
    console.log('📦 Received payload on world service:', payload);

    return this.svc.addVillageToTile(payload);
  }
}
