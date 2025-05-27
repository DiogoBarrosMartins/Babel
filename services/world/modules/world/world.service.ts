import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../world/prisma/prisma.service';
import { KafkaService } from '../../../../libs/kafka/kafka.service';
import { STATIC_RACES } from '../../../../libs/types/race-type';
import { Prisma } from '@prisma/client';

const WORLD_SIZE = 420;
const NPC_VILLAGE_COUNT = 20;
const MAX_PLACEMENT_ATTEMPTS = 5;

enum TileType {
  EMPTY = 'EMPTY',
  VILLAGE = 'VILLAGE',
  OUTPOST = 'OUTPOST',
}

enum RaceType {
  NONE = 'NONE',
  NEUTRAL = 'NEUTRAL',
}

enum Zone {
  CORE = 'CORE',
  MID = 'MID',
  OUTER = 'OUTER',
}

@Injectable()
export class WorldService {
  private readonly logger = new Logger(WorldService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async onModuleInit(): Promise<void> {
    const existingWorld = await this.prisma.world.findFirst();

    if (!existingWorld) {
      this.logger.warn('🌍 No world found. Generating one...');
      await this.generateWorld();
    } else {
      this.logger.log(
        `🌐 World already exists. Created at ${existingWorld.createdAt}`,
      );
    }
  }

  async generateWorld() {
    const alreadyExists = await this.prisma.world.findFirst();
    if (alreadyExists) {
      this.logger.warn('⚠️ World already exists. Skipping generation.');
      return;
    }
    await this.prisma.world.create({
      data: { name: 'Default World', size: WORLD_SIZE },
    });

    this.logger.log('🌍 Starting world generation...');
    await this.createEmptyTiles();

    const hubLocations = await this.placeFactionStructures();
    await this.generateNpcVillages(hubLocations);

    this.logger.log('✅ World generation complete.');
  }

  private async createEmptyTiles() {
    const tiles = [];

    for (let x = 0; x < WORLD_SIZE; x++) {
      for (let y = 0; y < WORLD_SIZE; y++) {
        tiles.push({
          x,
          y,
          name: `(${x},${y})`,
          type: TileType.EMPTY,
          race: RaceType.NONE,
          playerId: 'SYSTEM',
          playerName: 'SYSTEM',
        });
      }
    }

    await this.prisma.tile.createMany({ data: tiles });
    this.logger.log(`✅ Created ${tiles.length} base tiles.`);
  }
  private async placeFactionStructures(): Promise<{ x: number; y: number }[]> {
    const hubs: { x: number; y: number }[] = [];

    for (const race of STATIC_RACES) {
      hubs.push({ x: race.hubX, y: race.hubY });

      await this.prisma.tile.update({
        where: { x_y: { x: race.hubX, y: race.hubY } },
        data: {
          name: race.hubName,
          type: TileType.OUTPOST,
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

      for (const outpost of race.outposts) {
        await this.prisma.tile.update({
          where: { x_y: { x: outpost.x, y: outpost.y } },
          data: {
            name: outpost.name,
            type: TileType.OUTPOST,
            race: race.name,
            playerId: 'SYSTEM',
            playerName: 'SYSTEM',
            metadata: {
              outpostType: outpost.type,
            },
          },
        });

        this.logger.log(
          `🏕️ Outpost '${outpost.name}' placed at (${outpost.x}, ${outpost.y})`,
        );
      }
    }

    return hubs;
  }

  private async generateNpcVillages(hubLocations: { x: number; y: number }[]) {
    for (let i = 0; i < NPC_VILLAGE_COUNT; i++) {
      const { x, y } = await this.getAvailableCoordinates();

      const nearestHub = this.findNearestHub(x, y, hubLocations);
      const distance = this.getDistance(x, y, nearestHub.x, nearestHub.y);
      const zone = this.classifyZone(distance);

      const metadata: Prisma.JsonObject = this.getNpcMetadata(zone);

      await this.prisma.tile.updateMany({
        where: { x, y },
        data: {
          type: TileType.VILLAGE,
          name: `Bandit Camp ${i + 1}`,
          race: RaceType.NEUTRAL,
          metadata,
        },
      });
    }

    this.logger.log('🎯 Non-player villages created.');
  }

  private async getAvailableCoordinates(): Promise<{ x: number; y: number }> {
    for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
      const x = Math.floor(Math.random() * WORLD_SIZE);
      const y = Math.floor(Math.random() * WORLD_SIZE);

      const tile = await this.prisma.tile.findFirst({
        where: { x, y },
      });

      if (tile && tile.type === TileType.EMPTY) {
        return { x, y };
      }
    }

    throw new Error('Failed to find empty tile after several attempts');
  }

  async addVillageToTile(data: {
    race: string;
    playerId: string;
    playerName: string;
    name: string;
  }) {
    const { race, playerId, playerName, name } = data;

    if (!name || !playerId || !playerName) {
      throw new BadRequestException('Missing required fields in payload');
    }

    const { x, y } = await this.getAvailableCoordinates();

    await this.prisma.tile.create({
      data: {
        x,
        y,
        name,
        type: TileType.VILLAGE,
        race,
        playerId,
        playerName,
      },
    });

    await this.kafka.emit('player.allocated', {
      x,
      y,
      playerId,
      race,
      playerName,
      name,
    });

    this.logger.log(
      `✅ Village ${name} added at (${x}, ${y}) for ${playerName}`,
    );
  }

  private findNearestHub(
    x: number,
    y: number,
    hubs: { x: number; y: number }[],
  ) {
    return hubs.reduce((closest, hub) => {
      return this.getDistance(x, y, hub.x, hub.y) <
        this.getDistance(x, y, closest.x, closest.y)
        ? hub
        : closest;
    }, hubs[0]);
  }

  private classifyZone(distance: number): Zone {
    if (distance <= 10) return Zone.CORE;
    if (distance <= 25) return Zone.MID;
    return Zone.OUTER;
  }

  private getNpcMetadata(zone: Zone): Prisma.JsonObject {
    switch (zone) {
      case Zone.CORE:
        return {
          zone,
          difficulty: 'EASY',
          loot: { wood: 100, gold: 50 },
        };
      case Zone.MID:
        return {
          zone,
          difficulty: 'MODERATE',
          loot: { wood: 200, gold: 150 },
          expansionReward: 'MINOR_BUFF',
        };
      case Zone.OUTER:
        return {
          zone,
          difficulty: 'HARD',
          loot: { wood: 400, gold: 300 },
          expansionReward: 'RARE_RESOURCE',
          eventTrigger: true,
        };
    }
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
}
