import { Module } from '@nestjs/common';
import { WorldService } from './world.service';
import { WorldController } from './world.controller';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';
import { PrismaService } from '../../../world/prisma/prisma.service';

@Module({
  imports: [KafkaModule],
  controllers: [WorldController],
  providers: [WorldService, PrismaService],
  exports: [WorldService],
})
export class WorldModule {}
