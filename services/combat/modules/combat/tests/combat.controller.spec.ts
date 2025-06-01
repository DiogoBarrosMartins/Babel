import { Test, TestingModule } from '@nestjs/testing';
import { CombatController } from './combat.controller';
import { CombatService } from './combat.service';

describe('CombatController', () => {
  let controller: CombatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CombatController],
      providers: [CombatService],
    }).compile();

    controller = module.get<CombatController>(CombatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
