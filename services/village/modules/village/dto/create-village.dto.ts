import { IsString, IsUUID, IsOptional, IsInt } from 'class-validator';

export class CreateVillageDto {
  @IsString()
  name: string;

  @IsUUID()
  playerId: string;

  playerName: string;

  @IsOptional()
  @IsInt()
  x?: number;

  race: string;

  @IsOptional()
  @IsInt()
  y?: number;
}
