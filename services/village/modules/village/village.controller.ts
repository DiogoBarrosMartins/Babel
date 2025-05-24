import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VillageService } from './village.service';
import { CreateVillageDto } from './dto/create-village.dto';
import { UpdateVillageDto } from './dto/update-village.dto';

@Controller('village')
export class VillageController {
  constructor(private readonly villageService: VillageService) {}

  @Post()
  create(@Body() createVillageDto: CreateVillageDto) {
    return this.villageService.create(createVillageDto);
  }

  @Get()
  findAll() {
    return this.villageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.villageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVillageDto: UpdateVillageDto) {
    return this.villageService.update(+id, updateVillageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.villageService.remove(+id);
  }
}
