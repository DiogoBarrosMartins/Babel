import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../world/prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';

@Injectable()
export class WorldService {
  private readonly logger = new Logger(WorldService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async addVillageToTile(data: {
    race: string;
    playerId: string;
    playerName: string;
    name: string;
  }) {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);

    if (!data.name || !data.playerId || !data.playerName) {
      throw new Error('❌ Missing required fields in payload');
    }

    await this.prisma.tile.create({
      data: {
        x,
        y,
        name: data.name,
        type: 'VILLAGE',
        race: data.race,
        playerName: data.playerName,
        playerId: data.playerId,
      },
    });
    await this.kafka.emit('player.allocated', {
      x,
      y,
      playerId: data.playerId,
      race: data.race,
      playerName: data.playerName,
      name: data.name,
    });
    this.logger.log(
      `✅ Village ${data.name} added to tile at (${x}, ${y}) for player ${data.playerName}`,
    );
  }

  findAll() {
    return `This action returns all world`;
  }

  findOne(id: number) {
    return `This action returns a #${id} world`;
  }

  remove(id: number) {
    return `This action removes a #${id} world`;
  }
}
