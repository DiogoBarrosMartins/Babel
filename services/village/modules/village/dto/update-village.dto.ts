import { PartialType } from '@nestjs/mapped-types';
import { CreateVillageDto } from './create-village.dto';

export class UpdateVillageDto extends PartialType(CreateVillageDto) {}
