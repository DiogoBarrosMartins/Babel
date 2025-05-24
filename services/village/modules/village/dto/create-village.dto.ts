import { IsString, IsUUID, IsOptional, IsInt } from 'class-validator';

export class CreateVillageDto {
  @IsString()
  name: string;

  @IsUUID()
  playerId: string;

  @IsOptional()
  @IsInt()
  x?: number;

  @IsOptional()
  @IsInt()
  y?: number;
}
