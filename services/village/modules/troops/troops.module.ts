import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResourceModule } from '../resource/resource.module';
import { TrainingModule } from '../training/training.module';
import { TroopService } from './troops.service';
import { TroopsController } from './troops.controller';

@Module({
  imports: [PrismaModule, ResourceModule, TrainingModule],
  providers: [TroopService],
  controllers: [TroopsController],
  exports: [TroopService],
})
export class TroopModule {}
