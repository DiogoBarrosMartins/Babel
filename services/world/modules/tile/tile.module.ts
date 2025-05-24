import { Module } from '@nestjs/common';
import { TileService } from './tile.service';
import { TileController } from './tile.controller';

@Module({
  controllers: [TileController],
  providers: [TileService],
})
export class TileModule {}
