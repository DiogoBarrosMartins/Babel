import { IsString, IsIn, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TROOP_TYPES } from '../../../../../libs/types/troop-types';

const troopTypeKeys = Object.keys(TROOP_TYPES) as Array<
  keyof typeof TROOP_TYPES
>;

export class CreateTroopDto {
  @ApiProperty({
    description: 'Identifier of the troop type to train',
    example: 'human_swordsman',
    enum: troopTypeKeys,
  })
  @IsString()
  @IsIn(troopTypeKeys)
  troopType: keyof typeof TROOP_TYPES;

  @ApiProperty({
    description: 'How many units of this troop to train',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  count: number;
}
