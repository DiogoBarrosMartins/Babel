import { Test, TestingModule } from '@nestjs/testing';
import { VillageController } from './village.controller';
import { VillageService } from './village.service';

describe('VillageController', () => {
  let controller: VillageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VillageController],
      providers: [VillageService],
    }).compile();

    controller = module.get<VillageController>(VillageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
