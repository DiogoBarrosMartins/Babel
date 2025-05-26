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
  wood: number;
  clay: number;
  iron: number;
  grain: number;
  buildTimeSeconds: number;
}

const BASE_COSTS: Record<BuildingType, BuildingCost> = {
  [BuildingType.SAWMILL]: {
    wood: 100,
    clay: 50,
    iron: 30,
    grain: 20,
    buildTimeSeconds: 60,
  },
  [BuildingType.CLAY_PIT]: {
    wood: 80,
    clay: 40,
    iron: 20,
    grain: 10,
    buildTimeSeconds: 45,
  },
  [BuildingType.IRON_MINE]: {
    wood: 90,
    clay: 45,
    iron: 25,
    grain: 15,
    buildTimeSeconds: 50,
  },
  [BuildingType.FARM]: {
    wood: 70,
    clay: 35,
    iron: 15,
    grain: 10,
    buildTimeSeconds: 40,
  },
  [BuildingType.WAREHOUSE]: {
    wood: 120,
    clay: 100,
    iron: 60,
    grain: 30,
    buildTimeSeconds: 90,
  },
  [BuildingType.GRANARY]: {
    wood: 110,
    clay: 90,
    iron: 50,
    grain: 30,
    buildTimeSeconds: 90,
  },
  [BuildingType.MARKET]: {
    wood: 100,
    clay: 100,
    iron: 80,
    grain: 60,
    buildTimeSeconds: 100,
  },
  [BuildingType.BARRACKS]: {
    wood: 150,
    clay: 100,
    iron: 80,
    grain: 50,
    buildTimeSeconds: 100,
  },
  [BuildingType.STABLE]: {
    wood: 160,
    clay: 110,
    iron: 90,
    grain: 60,
    buildTimeSeconds: 110,
  },
  [BuildingType.WORKSHOP]: {
    wood: 170,
    clay: 130,
    iron: 100,
    grain: 70,
    buildTimeSeconds: 120,
  },
  [BuildingType.WALL]: {
    wood: 100,
    clay: 130,
    iron: 80,
    grain: 40,
    buildTimeSeconds: 90,
  },
  [BuildingType.TOWER]: {
    wood: 120,
    clay: 140,
    iron: 90,
    grain: 50,
    buildTimeSeconds: 100,
  },
  [BuildingType.SMITHY]: {
    wood: 140,
    clay: 120,
    iron: 110,
    grain: 70,
    buildTimeSeconds: 100,
  },
  [BuildingType.EMBASSY]: {
    wood: 130,
    clay: 80,
    iron: 50,
    grain: 40,
    buildTimeSeconds: 90,
  },
  [BuildingType.ACADEMY]: {
    wood: 150,
    clay: 100,
    iron: 90,
    grain: 60,
    buildTimeSeconds: 100,
  },
  [BuildingType.SHRINE]: {
    wood: 140,
    clay: 110,
    iron: 100,
    grain: 70,
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
          wood: Math.round(base.wood * scale.cost ** lvl),
          clay: Math.round(base.clay * scale.cost ** lvl),
          iron: Math.round(base.iron * scale.cost ** lvl),
          grain: Math.round(base.grain * scale.cost ** lvl),
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
