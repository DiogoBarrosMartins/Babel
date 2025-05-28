import { Test, TestingModule } from '@nestjs/testing';
import { TroopsController } from '../troops.controller';
import { TroopsService } from '../troops.service';

describe('TroopsController', () => {
  let controller: TroopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TroopsController],
      providers: [TroopsService],
    }).compile();

    controller = module.get<TroopsController>(TroopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
