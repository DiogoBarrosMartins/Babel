import { PartialType } from '@nestjs/mapped-types';
import { CreateCombatDto } from './create-combat.dto';

export class UpdateCombatDto extends PartialType(CreateCombatDto) {}
