import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VillageService } from './village.service';
import { VillageController } from './village.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { KafkaModule } from '../../../../libs/kafka/kafka.module';
import { ResourceModule } from '../resource/resource.module';
import { BuildingModule } from '../building/building.module';
import { ConstructionModule } from '../construction/construction.module';
import { TroopModule } from '../troops/troops.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'construction' }),
    forwardRef(() => BuildingModule),
    forwardRef(() => ConstructionModule),
    ResourceModule,
    KafkaModule,
    PrismaModule,
    TroopModule,
  ],
  controllers: [VillageController],
  providers: [VillageService],
  exports: [VillageService],
})
export class VillageModule {}
