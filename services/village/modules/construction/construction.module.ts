import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PrismaService } from '../../../village/prisma/prisma.service';
import { ConstructionProcessor } from './construction.processor';

import { ConstructionService } from './construction.service';
import { BuildingModule } from '../building/building.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'construction' }),
    forwardRef(() => BuildingModule),
  ],
  providers: [PrismaService, ConstructionService, ConstructionProcessor],
  exports: [ConstructionService],
})
export class ConstructionModule {}
