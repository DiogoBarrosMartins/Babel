import { Test, TestingModule } from '@nestjs/testing';
import { TroopsService } from './troops.service';

describe('TroopsService', () => {
  let service: TroopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TroopsService],
    }).compile();

    service = module.get<TroopsService>(TroopsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
