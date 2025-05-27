import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../world/prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { STATIC_RACES } from '../../../../libs/types/race-type';

@Injectable()
export class WorldService {
  private readonly logger = new Logger(WorldService.name);
  private readonly WORLD_SIZE = 100;

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

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private classifyZone(distance: number): 'CORE' | 'MID' | 'OUTER' {
    if (distance <= 10) return 'CORE';
    if (distance <= 25) return 'MID';
    return 'OUTER';
  }

  async generateWorld() {
    this.logger.log('🌍 Starting world generation...');

    // Step 1: Create EMPTY tiles
    const baseTiles = [];
    for (let x = 0; x < this.WORLD_SIZE; x++) {
      for (let y = 0; y < this.WORLD_SIZE; y++) {
        baseTiles.push({
          x,
          y,
          name: `(${x},${y})`,
          type: 'EMPTY',
          race: 'NONE',
          playerId: 'SYSTEM',
          playerName: 'SYSTEM',
        });
      }
    }
    await this.prisma.tile.createMany({ data: baseTiles });
    this.logger.log(`✅ Created ${baseTiles.length} base tiles.`);

    // Step 2: Use STATIC_RACES to place hubs and outposts
    const hubLocations: { x: number; y: number }[] = [];

    for (const race of STATIC_RACES) {
      hubLocations.push({ x: race.hubX, y: race.hubY });

      // Create Hub
      await this.prisma.tile.create({
        data: {
          x: race.hubX,
          y: race.hubY,
          name: race.hubName,
          type: 'OUTPOST',
          race: race.name,
          playerId: 'SYSTEM',
          playerName: 'SYSTEM',
          metadata: {
            outpostType: 'HUB',
            description: race.description,
            traits: race.traits,
          },
        },
      });
      this.logger.log(
        `🏰 Hub placed for ${race.name} at (${race.hubX}, ${race.hubY})`,
      );

      // Create Outposts
      for (const outpost of race.outposts) {
        await this.prisma.tile.create({
          data: {
            x: outpost.x,
            y: outpost.y,
            name: outpost.name,
            type: 'OUTPOST',
            race: race.name,
            playerId: 'SYSTEM',
            playerName: 'SYSTEM',
            metadata: {
              outpostType: outpost.type,
            },
          },
        });
        this.logger.log(
          `🏕️ Outpost '${outpost.name}' placed for ${race.name} at (${outpost.x}, ${outpost.y})`,
        );
      }
    }

    // Step 3: Generate non-player villages with zone classification
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * this.WORLD_SIZE);
      const y = Math.floor(Math.random() * this.WORLD_SIZE);

      // Find the nearest hub
      const nearestHub = hubLocations.reduce((closest, hub) => {
        const d = this.getDistance(x, y, hub.x, hub.y);
        const dc = this.getDistance(x, y, closest.x, closest.y);
        return d < dc ? hub : closest;
      }, hubLocations[0]);

      const distance = this.getDistance(x, y, nearestHub.x, nearestHub.y);
      const zone = this.classifyZone(distance);

      const metadata: any = { zone };

      if (zone === 'CORE') {
        metadata.difficulty = 'EASY';
        metadata.loot = { wood: 100, gold: 50 };
      } else if (zone === 'MID') {
        metadata.difficulty = 'MODERATE';
        metadata.loot = { wood: 200, gold: 150 };
        metadata.expansionReward = 'MINOR_BUFF';
      } else if (zone === 'OUTER') {
        metadata.difficulty = 'HARD';
        metadata.loot = { wood: 400, gold: 300 };
        metadata.expansionReward = 'RARE_RESOURCE';
        metadata.eventTrigger = true;
      }

      await this.prisma.tile.updateMany({
        where: { x, y },
        data: {
          type: 'VILLAGE',
          name: `Bandit Camp ${i + 1}`,
          race: 'NEUTRAL',
          metadata,
        },
      });
    }

    this.logger.log('🎯 Non-player villages created.');
    this.logger.log('✅ World generation complete.');
  }
}
