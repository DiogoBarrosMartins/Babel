import { PartialType } from '@nestjs/mapped-types';
import { CreateRaceDto } from './create-race.dto';

export class UpdateRaceDto extends PartialType(CreateRaceDto) {}
