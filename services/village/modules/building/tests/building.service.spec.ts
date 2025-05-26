import { Test, TestingModule } from '@nestjs/testing';
import { BuildingService } from '../building.service';

describe('BuildingService', () => {
  let service: BuildingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildingService],
    }).compile();

    service = module.get<BuildingService>(BuildingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
