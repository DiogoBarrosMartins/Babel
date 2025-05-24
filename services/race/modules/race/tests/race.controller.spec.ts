import { Test, TestingModule } from '@nestjs/testing';
import { RaceController } from './race.controller';
import { RaceService } from './race.service';

describe('RaceController', () => {
  let controller: RaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaceController],
      providers: [RaceService],
    }).compile();

    controller = module.get<RaceController>(RaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
