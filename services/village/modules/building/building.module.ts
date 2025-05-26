import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BuildingService } from './building.service';
import { ConstructionModule } from '../construction/construction.module';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [
    ConstructionModule,
    ResourceModule,
    forwardRef(() => ConstructionModule),
  ],
  providers: [PrismaService, BuildingService],
  exports: [BuildingService],
})
export class BuildingModule {}
