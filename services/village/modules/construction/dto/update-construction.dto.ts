import { PartialType } from '@nestjs/mapped-types';
import { CreateConstructionDto } from './create-construction.dto';

export class UpdateConstructionDto extends PartialType(CreateConstructionDto) {}
