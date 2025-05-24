import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';

@Module({
  controllers: [RaceController],
  providers: [RaceService],
})
export class RaceModule {}
