import { Controller, Get, Param, Delete } from '@nestjs/common';
import { RaceService } from './race.service';

@Controller('race')
export class RaceController {
  constructor(private readonly raceService: RaceService) {}

  @Get()
  findAll() {
    return this.raceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.raceService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.raceService.remove(+id);
  }
}
