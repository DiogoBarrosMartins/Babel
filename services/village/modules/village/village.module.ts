import { Module } from '@nestjs/common';
import { VillageService } from './village.service';
import { VillageController } from './village.controller';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';
import { PrismaService } from '../../../village/prisma/prisma.service';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [KafkaModule, ResourceModule],
  controllers: [VillageController],
  providers: [VillageService, PrismaService],
  exports: [VillageService],
})
export class VillageModule {}
