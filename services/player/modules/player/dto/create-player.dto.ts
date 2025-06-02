import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Unique username of the player',
    example: 'ShadowKnight42',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Valid email address of the player',
    example: 'player@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'UUID of the race this player belongs to',
    example: 'HUMAN',
  })
  @IsString()
  race: string;
}
