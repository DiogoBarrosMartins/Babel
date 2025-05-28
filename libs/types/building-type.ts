export enum BuildingType {
  SAWMILL = 'SAWMILL',
  CLAY_PIT = 'CLAY_PIT',
  IRON_MINE = 'IRON_MINE',
  FARM = 'FARM',
  WAREHOUSE = 'WAREHOUSE',
  GRANARY = 'GRANARY',
  MARKET = 'MARKET',
  BARRACKS = 'BARRACKS',
  STABLE = 'STABLE',
  WORKSHOP = 'WORKSHOP',
  WALL = 'WALL',
  TOWER = 'TOWER',
  SMITHY = 'SMITHY',
  EMBASSY = 'EMBASSY',
  ACADEMY = 'ACADEMY',
  SHRINE = 'SHRINE',
}

export interface BuildingCost {
  food: number;
  wood: number;
  stone: number;
  gold: number;
  buildTimeSeconds: number;
}

const BASE_COSTS: Record<BuildingType, BuildingCost> = {
  [BuildingType.SAWMILL]: {
    food: 20,
    wood: 100,
    stone: 50,
    gold: 30,
    buildTimeSeconds: 60,
  },
  [BuildingType.CLAY_PIT]: {
    food: 10,
    wood: 80,
    stone: 40,
    gold: 20,
    buildTimeSeconds: 45,
  },
  [BuildingType.IRON_MINE]: {
    food: 15,
    wood: 90,
    stone: 45,
    gold: 25,
    buildTimeSeconds: 50,
  },
  [BuildingType.FARM]: {
    food: 10,
    wood: 70,
    stone: 35,
    gold: 15,
    buildTimeSeconds: 40,
  },
  [BuildingType.WAREHOUSE]: {
    food: 30,
    wood: 120,
    stone: 100,
    gold: 60,
    buildTimeSeconds: 90,
  },
  [BuildingType.GRANARY]: {
    food: 30,
    wood: 110,
    stone: 90,
    gold: 50,
    buildTimeSeconds: 90,
  },
  [BuildingType.MARKET]: {
    food: 60,
    wood: 100,
    stone: 100,
    gold: 80,
    buildTimeSeconds: 100,
  },
  [BuildingType.BARRACKS]: {
    food: 50,
    wood: 150,
    stone: 100,
    gold: 80,
    buildTimeSeconds: 100,
  },
  [BuildingType.STABLE]: {
    food: 60,
    wood: 160,
    stone: 110,
    gold: 90,
    buildTimeSeconds: 110,
  },
  [BuildingType.WORKSHOP]: {
    food: 70,
    wood: 170,
    stone: 130,
    gold: 100,
    buildTimeSeconds: 120,
  },
  [BuildingType.WALL]: {
    food: 40,
    wood: 100,
    stone: 130,
    gold: 80,
    buildTimeSeconds: 90,
  },
  [BuildingType.TOWER]: {
    food: 50,
    wood: 120,
    stone: 140,
    gold: 90,
    buildTimeSeconds: 100,
  },
  [BuildingType.SMITHY]: {
    food: 70,
    wood: 140,
    stone: 120,
    gold: 110,
    buildTimeSeconds: 100,
  },
  [BuildingType.EMBASSY]: {
    food: 40,
    wood: 130,
    stone: 80,
    gold: 50,
    buildTimeSeconds: 90,
  },
  [BuildingType.ACADEMY]: {
    food: 60,
    wood: 150,
    stone: 100,
    gold: 90,
    buildTimeSeconds: 100,
  },
  [BuildingType.SHRINE]: {
    food: 70,
    wood: 140,
    stone: 110,
    gold: 100,
    buildTimeSeconds: 100,
  },
};

const LEVEL_CAPS: Record<BuildingType, number> = {
  [BuildingType.SAWMILL]: 20,
  [BuildingType.CLAY_PIT]: 20,
  [BuildingType.IRON_MINE]: 20,
  [BuildingType.FARM]: 20,
  [BuildingType.WAREHOUSE]: 20,
  [BuildingType.GRANARY]: 20,
  [BuildingType.MARKET]: 20,
  [BuildingType.BARRACKS]: 10,
  [BuildingType.STABLE]: 10,
  [BuildingType.WORKSHOP]: 10,
  [BuildingType.WALL]: 10,
  [BuildingType.TOWER]: 10,
  [BuildingType.SMITHY]: 10,
  [BuildingType.EMBASSY]: 10,
  [BuildingType.ACADEMY]: 10,
  [BuildingType.SHRINE]: 10,
};

const SCALING_FACTORS: Record<BuildingType, { cost: number; time: number }> = {
  [BuildingType.SAWMILL]: { cost: 1.8, time: 1.4 },
  [BuildingType.CLAY_PIT]: { cost: 1.8, time: 1.4 },
  [BuildingType.IRON_MINE]: { cost: 1.8, time: 1.4 },
  [BuildingType.FARM]: { cost: 1.8, time: 1.4 },
  [BuildingType.WAREHOUSE]: { cost: 1.7, time: 1.3 },
  [BuildingType.GRANARY]: { cost: 1.7, time: 1.3 },
  [BuildingType.MARKET]: { cost: 1.7, time: 1.3 },
  [BuildingType.BARRACKS]: { cost: 1.9, time: 1.5 },
  [BuildingType.STABLE]: { cost: 1.9, time: 1.5 },
  [BuildingType.WORKSHOP]: { cost: 1.9, time: 1.5 },
  [BuildingType.WALL]: { cost: 1.9, time: 1.5 },
  [BuildingType.TOWER]: { cost: 1.9, time: 1.5 },
  [BuildingType.SMITHY]: { cost: 1.9, time: 1.5 },
  [BuildingType.EMBASSY]: { cost: 1.75, time: 1.45 },
  [BuildingType.ACADEMY]: { cost: 1.75, time: 1.45 },
  [BuildingType.SHRINE]: { cost: 1.75, time: 1.45 },
};

export const BUILDING_COSTS: Record<BuildingType, BuildingCost[]> =
  Object.fromEntries(
    Object.entries(BASE_COSTS).map(([type, base]) => {
      const cap = LEVEL_CAPS[type as BuildingType];
      const scale = SCALING_FACTORS[type as BuildingType];
      const levels: BuildingCost[] = [];
      for (let lvl = 0; lvl < cap; lvl++) {
        levels.push({
          food: Math.round(base.food * scale.cost ** lvl),
          wood: Math.round(base.wood * scale.cost ** lvl),
          stone: Math.round(base.stone * scale.cost ** lvl),
          gold: Math.round(base.gold * scale.cost ** lvl),
          buildTimeSeconds: Math.round(
            base.buildTimeSeconds * scale.time ** lvl,
          ),
        });
      }
      return [type, levels];
    }),
  ) as Record<BuildingType, BuildingCost[]>;

export const BUILDING_PRODUCTION_INCREASES: Record<BuildingType, number[]> = {
  [BuildingType.SAWMILL]: Array.from({ length: 20 }, (_, i) =>
    i === 0 ? 0 : i,
  ),
  [BuildingType.CLAY_PIT]: Array.from({ length: 20 }, (_, i) =>
    i === 0 ? 0 : i,
  ),
  [BuildingType.IRON_MINE]: Array.from({ length: 20 }, (_, i) =>
    i === 0 ? 0 : i,
  ),
  [BuildingType.FARM]: Array.from({ length: 20 }, (_, i) => (i === 0 ? 0 : i)),
  [BuildingType.WAREHOUSE]: [],
  [BuildingType.GRANARY]: [],
  [BuildingType.MARKET]: [],
  [BuildingType.BARRACKS]: [],
  [BuildingType.STABLE]: [],
  [BuildingType.WORKSHOP]: [],
  [BuildingType.WALL]: [],
  [BuildingType.TOWER]: [],
  [BuildingType.SMITHY]: [],
  [BuildingType.EMBASSY]: [],
  [BuildingType.ACADEMY]: [],
  [BuildingType.SHRINE]: [],
};

export const BUILD_TIMES_MS: Record<BuildingType, number[]> =
  Object.fromEntries(
    Object.entries(BUILDING_COSTS).map(([type, costs]) => [
      type,
      costs.map((c) => c.buildTimeSeconds * 1000),
    ]),
  ) as Record<BuildingType, number[]>;
