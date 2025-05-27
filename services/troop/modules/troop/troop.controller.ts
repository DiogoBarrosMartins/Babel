import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TroopService } from './troop.service';
import { CreateTroopDto } from './dto/create-troop.dto';
import { UpdateTroopDto } from './dto/update-troop.dto';

@Controller('troop')
export class TroopController {
  constructor(private readonly troopService: TroopService) {}

  @Post()
  create(@Body() createTroopDto: CreateTroopDto) {
    return this.troopService.create(createTroopDto);
  }

  @Get()
  findAll() {
    return this.troopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.troopService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTroopDto: UpdateTroopDto) {
    return this.troopService.update(+id, updateTroopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.troopService.remove(+id);
  }
}
