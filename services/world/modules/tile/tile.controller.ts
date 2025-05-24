import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TileService } from './tile.service';
import { CreateTileDto } from './dto/create-tile.dto';
import { UpdateTileDto } from './dto/update-tile.dto';

@Controller('tile')
export class TileController {
  constructor(private readonly tileService: TileService) {}

  @Post()
  create(@Body() createTileDto: CreateTileDto) {
    return this.tileService.create(createTileDto);
  }

  @Get()
  findAll() {
    return this.tileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTileDto: UpdateTileDto) {
    return this.tileService.update(+id, updateTileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tileService.remove(+id);
  }
}
