import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;
}
