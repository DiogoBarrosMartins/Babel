import { Test, TestingModule } from '@nestjs/testing';
import { TileController } from '../tile.controller';
import { TileService } from '../tile.service';

describe('TileController', () => {
  let controller: TileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TileController],
      providers: [TileService],
    }).compile();

    controller = module.get<TileController>(TileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
