import { Controller, Post, Body } from '@nestjs/common';
import { BuildingService } from './building.service';
import { UpgradeBuildingDto } from './dto/update-building.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Buildings')
@Controller('building')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post('upgrade')
  @ApiOperation({ summary: 'Faz upgrade de um edifício de uma vila' })
  @ApiResponse({ status: 201, description: 'Construção iniciada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos.' })
  async upgrade(@Body() dto: UpgradeBuildingDto) {
    return this.buildingService.upgradeBuilding(dto.villageId, dto.type);
  }
}
