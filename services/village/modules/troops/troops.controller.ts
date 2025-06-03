import { Controller, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { TroopService } from './troops.service';
import { CreateTroopDto } from './dto/create-troop.dto';

@ApiTags('Troops')
@Controller('villages/:villageId/troops')
export class TroopsController {
  constructor(private readonly troopService: TroopService) {}

  @Post()
  @ApiOperation({ summary: 'Start a troop training' })
  @ApiParam({
    name: 'villageId',
    description: 'UUID of the village ',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: CreateTroopDto })
  @ApiCreatedResponse({
    description: 'Success',
    schema: {
      example: {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        finishAt: '2025-05-28T21:45:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid troop type',
  })
  @ApiNotFoundResponse({
    description: 'No village',
  })
  async trainTroops(
    @Param('villageId', new ParseUUIDPipe()) villageId: string,
    @Body() dto: CreateTroopDto,
  ) {
    return this.troopService.trainTroops(villageId, dto.troopType, dto.count);
  }
}
