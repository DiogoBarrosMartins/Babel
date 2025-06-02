import { Body, Controller, Post } from '@nestjs/common';
import { CombatService } from './combat.service';
import { AttackRequestDto } from './dto/attack-request.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Combat')
@Controller()
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  @Post('attack')
  @ApiOperation({ summary: 'Trigger an attack from a village' })
  @ApiBody({ type: AttackRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Attack event emitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async triggerAttack(@Body() payload: AttackRequestDto) {
    return this.combatService.initiateAttack(payload);
  }
}
