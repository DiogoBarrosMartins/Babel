import { PartialType } from '@nestjs/mapped-types';
import { CreateTroopDto } from './create-troop.dto';

export class UpdateTroopDto extends PartialType(CreateTroopDto) {}
