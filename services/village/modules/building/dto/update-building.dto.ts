import { IsUUID, IsEnum } from 'class-validator';
import { BuildingType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeBuildingDto {
  @ApiProperty({
    description: 'ID da vila onde o edifício será melhorado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  villageId: string;

  @ApiProperty({
    description: 'Tipo do edifício a melhorar',
    enum: BuildingType,
    example: 'SAWMILL',
  })
  @IsEnum(BuildingType)
  type: BuildingType;
}
