import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerService } from './player.service';

@ApiTags('Player')
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new player' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({ status: 201, description: 'Player created successfully' })
  create(@Body() dto: CreatePlayerDto) {
    return this.playerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all players' })
  @ApiResponse({ status: 200, description: 'List of players' })
  findAll() {
    return this.playerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a player by ID' })
  @ApiParam({ name: 'id', description: 'Player UUID' })
  @ApiResponse({ status: 200, description: 'Player found' })
  findOne(@Param('id') id: string) {
    return this.playerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a player' })
  @ApiParam({ name: 'id', description: 'Player UUID' })
  @ApiBody({ type: CreatePlayerDto, description: 'Partial player data' })
  @ApiResponse({ status: 200, description: 'Player updated' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePlayerDto>) {
    return this.playerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a player' })
  @ApiParam({ name: 'id', description: 'Player UUID' })
  @ApiResponse({ status: 200, description: 'Player marked as deleted' })
  softDelete(@Param('id') id: string) {
    return this.playerService.softDelete(id);
  }
}
