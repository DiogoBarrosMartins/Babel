import { Test, TestingModule } from '@nestjs/testing';
import { TileService } from './tile.service';

describe('TileService', () => {
  let service: TileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TileService],
    }).compile();

    service = module.get<TileService>(TileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
