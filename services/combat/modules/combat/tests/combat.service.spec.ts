import { Test, TestingModule } from '@nestjs/testing';
import { CombatService } from './combat.service';

describe('CombatService', () => {
  let service: CombatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombatService],
    }).compile();

    service = module.get<CombatService>(CombatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
