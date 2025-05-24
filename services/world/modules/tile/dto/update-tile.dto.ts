import { PartialType } from '@nestjs/mapped-types';
import { CreateTileDto } from './create-tile.dto';

export class UpdateTileDto extends PartialType(CreateTileDto) {}
