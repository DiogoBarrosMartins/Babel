import { Test, TestingModule } from '@nestjs/testing';
import { ConstructionService } from '../construction.service';

describe('ConstructionService', () => {
  let service: ConstructionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConstructionService],
    }).compile();

    service = module.get<ConstructionService>(ConstructionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
