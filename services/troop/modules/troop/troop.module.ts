import { Module } from '@nestjs/common';
import { TroopService } from './troop.service';
import { TroopController } from './troop.controller';

@Module({
  controllers: [TroopController],
  providers: [TroopService],
})
export class TroopModule {}
