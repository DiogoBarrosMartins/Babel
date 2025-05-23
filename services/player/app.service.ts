import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../libs/kafka/kafka.service';

@Injectable()
export class AppService {
  constructor(private readonly kafka: KafkaService) {}

  startBuilding() {
    this.kafka.emit('village.building.started', {
      playerId: 'abc',
      villageId: 'v123',
      building: 'farm',
      cost: { wood: 200, clay: 150 },
    });
  }
}
