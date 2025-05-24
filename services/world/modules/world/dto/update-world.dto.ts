import { PartialType } from '@nestjs/mapped-types';
import { CreateWorldDto } from './create-world.dto';

export class UpdateWorldDto extends PartialType(CreateWorldDto) {}
