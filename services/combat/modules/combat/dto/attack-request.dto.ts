import { ApiProperty } from '@nestjs/swagger';

export class AttackRequestDto {
  @ApiProperty({ example: 'village-id-123' })
  attackerVillageId: string;

  @ApiProperty({ example: { x: 10, y: 12 } })
  origin: { x: number; y: number };

  @ApiProperty({ example: { x: 15, y: 18 } })
  target: { x: number; y: number };

  @ApiProperty({
    example: [
      { troopType: 'orc_grunt', quantity: 20 },
      { troopType: 'orc_raider', quantity: 10 },
    ],
  })
  troops: {
    troopType: string;
    quantity: number;
  }[];
}
