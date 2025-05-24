import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVillageDto } from './dto/create-village.dto';
import { UpdateVillageDto } from './dto/update-village.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';

@Injectable()
export class VillageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async create(dto: CreateVillageDto) {
    const village = await this.prisma.village.create({ data: dto });

    await this.kafka.emit('village.created', {
      id: village.id,
      name: village.name,
    });

    return village;
  }

  findAll() {
    return `This action returns all village`;
  }

  async findOne(id: string) {
    const v = await this.prisma.village.findUnique({ where: { id } });
    if (!v) throw new NotFoundException(`Village ${id} not found`);
    return v;
  }

  async update(id: number, data: UpdateVillageDto) {
    const village = await this.prisma.village.update({
      where: { id },
      data,
    });
    await this.kafka.emit('village.updated', {
      id: village.id,
      name: village.name,
      updatedAt: village.updatedAt,
    });
    return village;
  }

  remove(id: number) {
    return `This action removes a #${id} village`;
  }
}
