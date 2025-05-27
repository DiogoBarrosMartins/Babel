import { Injectable } from '@nestjs/common';
import { CreateTroopDto } from './dto/create-troop.dto';
import { UpdateTroopDto } from './dto/update-troop.dto';

@Injectable()
export class TroopService {
  create(createTroopDto: CreateTroopDto) {
    return 'This action adds a new troop';
  }

  findAll() {
    return `This action returns all troop`;
  }

  findOne(id: number) {
    return `This action returns a #${id} troop`;
  }

  update(id: number, updateTroopDto: UpdateTroopDto) {
    return `This action updates a #${id} troop`;
  }

  remove(id: number) {
    return `This action removes a #${id} troop`;
  }
}
