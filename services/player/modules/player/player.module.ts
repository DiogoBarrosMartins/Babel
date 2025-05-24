import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';

@Module({
  imports: [KafkaModule],
  controllers: [PlayerController],
  providers: [PlayerService, PrismaService],
})
export class PlayerModule {}
