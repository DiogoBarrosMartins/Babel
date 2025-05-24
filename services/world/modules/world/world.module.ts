import { Module } from '@nestjs/common';
import { WorldService } from './world.service';
import { WorldController } from './world.controller';

@Module({
  controllers: [WorldController],
  providers: [WorldService],
})
export class WorldModule {}
