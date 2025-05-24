import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorldService } from './world.service';
import { CreateWorldDto } from './dto/create-world.dto';
import { UpdateWorldDto } from './dto/update-world.dto';

@Controller('world')
export class WorldController {
  constructor(private readonly worldService: WorldService) {}

  @Post()
  create(@Body() createWorldDto: CreateWorldDto) {
    return this.worldService.create(createWorldDto);
  }

  @Get()
  findAll() {
    return this.worldService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.worldService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorldDto: UpdateWorldDto) {
    return this.worldService.update(+id, updateWorldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.worldService.remove(+id);
  }
}
