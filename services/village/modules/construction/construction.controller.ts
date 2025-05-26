import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConstructionService } from './construction.service';
import { CreateConstructionDto } from './dto/create-construction.dto';
import { UpdateConstructionDto } from './dto/update-construction.dto';

@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Post()
  create(@Body() createConstructionDto: CreateConstructionDto) {
    return this.constructionService.create(createConstructionDto);
  }

  @Get()
  findAll() {
    return this.constructionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConstructionDto: UpdateConstructionDto) {
    return this.constructionService.update(+id, updateConstructionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionService.remove(+id);
  }
}
