import { forwardRef, Module } from '@nestjs/common';
import { VillageService } from './village.service';
import { VillageController } from './village.controller';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';
import { PrismaService } from '../../prisma/prisma.service';
import { BullModule } from '@nestjs/bull';

import { BuildingModule } from '../building/building.module';
import { ConstructionModule } from '../construction/construction.module';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'construction' }),
    forwardRef(() => BuildingModule),
    forwardRef(() => ConstructionModule),
    ResourceModule,

    KafkaModule,
  ],
  controllers: [VillageController],
  providers: [VillageService, PrismaService],
  exports: [VillageService],
})
export class VillageModule {}
