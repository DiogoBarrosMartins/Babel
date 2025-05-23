import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka.service';

@Module({
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
