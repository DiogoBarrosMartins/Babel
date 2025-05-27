import { Test, TestingModule } from '@nestjs/testing';
import { TroopController } from './troop.controller';
import { TroopService } from './troop.service';

describe('TroopController', () => {
  let controller: TroopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TroopController],
      providers: [TroopService],
    }).compile();

    controller = module.get<TroopController>(TroopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
