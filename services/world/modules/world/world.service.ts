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

    // Step 1: Get all outposts of this race
    const outposts = await this.prisma.tile.findMany({
      where: {
        type: TileType.OUTPOST,
        race,
      },
    });

    if (outposts.length === 0) {
      throw new Error(`No outposts found for race "${race}"`);
    }

    // Step 2: Pick one outpost at random
    const origin = outposts[Math.floor(Math.random() * outposts.length)];

    // Step 3: Search for the closest available EMPTY tile around the outpost
    const { x, y } = await this.findEmptyTileNear(origin.x, origin.y);

    // Step 4: Update tile to be a village
    await this.prisma.tile.update({
      where: { x_y: { x, y } },
      data: {
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
      `✅ Village ${name} created at (${x}, ${y}) for ${playerName}`,
    );
  }
  private async findEmptyTileNear(
    originX: number,
    originY: number,
  ): Promise<{ x: number; y: number }> {
    const MAX_RADIUS = 10;

    for (let radius = 1; radius <= MAX_RADIUS; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = originX + dx;
          const y = originY + dy;

          if (x < 0 || y < 0 || x >= WORLD_SIZE || y >= WORLD_SIZE) continue;

          const tile = await this.prisma.tile.findUnique({
            where: { x_y: { x, y } },
          });

          if (tile && tile.type === TileType.EMPTY) {
            return { x, y };
          }
        }
      }
    }

    throw new Error('❌ Could not find nearby empty tile');
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

  async getTilesAround(x: number, y: number, radius = 20) {
    if (x < 0 || y < 0 || x >= WORLD_SIZE || y >= WORLD_SIZE) {
      throw new BadRequestException('Invalid coordinates');
    }

    const minX = Math.max(0, x - radius);
    const maxX = Math.min(WORLD_SIZE - 1, x + radius);
    const minY = Math.max(0, y - radius);
    const maxY = Math.min(WORLD_SIZE - 1, y + radius);

    const tiles = await this.prisma.tile.findMany({
      where: {
        x: { gte: minX, lte: maxX },
        y: { gte: minY, lte: maxY },
      },
      select: {
        x: true,
        y: true,
        type: true,
        race: true,
        playerName: true,
      },
    });

    return tiles;
  }
}
