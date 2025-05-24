import { Injectable } from '@nestjs/common';

@Injectable()
export class RaceService {
  findAll() {
    return `This action returns all race`;
  }

  findOne(id: number) {
    return `This action returns a #${id} race`;
  }

  remove(id: number) {
    return `This action removes a #${id} race`;
  }
}
