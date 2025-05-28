import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { VillageService } from './village.service';
import { Village } from '@prisma/client';

@ApiTags('Villages')
@Controller('villages')
export class VillageController {
  constructor(private readonly villageService: VillageService) {}

  @Get('/:playerId')
  @ApiOperation({ summary: 'Get all villages for a given player' })
  @ApiParam({
    name: 'playerId',
    description: 'UUID of the player whose villages you want to fetch',
    type: String,
  })
  @ApiOkResponse({
    description: 'Array of villages owned by that player',
    isArray: true,
  })
  async findByPlayer(@Param('playerId') playerId: string): Promise<Village[]> {
    return this.villageService.findByPlayer(playerId);
  }
}
