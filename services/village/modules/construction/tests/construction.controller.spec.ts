import { Test, TestingModule } from '@nestjs/testing';
import { ConstructionController } from './construction.controller';
import { ConstructionService } from './construction.service';

describe('ConstructionController', () => {
  let controller: ConstructionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstructionController],
      providers: [ConstructionService],
    }).compile();

    controller = module.get<ConstructionController>(ConstructionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
