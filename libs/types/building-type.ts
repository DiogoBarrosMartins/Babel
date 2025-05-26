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

// Define the cost and build time for each level of each building type
export const BUILDING_COSTS: Record<BuildingType, BuildingCost[]> = {
  [BuildingType.SAWMILL]: [
    { wood: 100, clay: 50, iron: 30, grain: 20, buildTimeSeconds: 60 },
    { wood: 200, clay: 100, iron: 60, grain: 40, buildTimeSeconds: 120 },
    // … add more levels as needed
  ],
  [BuildingType.CLAY_PIT]: [
    { wood: 80, clay: 40, iron: 20, grain: 10, buildTimeSeconds: 45 },
    { wood: 160, clay: 80, iron: 40, grain: 20, buildTimeSeconds: 90 },
  ],
  [BuildingType.IRON_MINE]: [
    { wood: 90, clay: 45, iron: 25, grain: 15, buildTimeSeconds: 50 },
    { wood: 180, clay: 90, iron: 50, grain: 30, buildTimeSeconds: 100 },
  ],
  [BuildingType.FARM]: [
    { wood: 70, clay: 35, iron: 15, grain: 10, buildTimeSeconds: 40 },
    { wood: 140, clay: 70, iron: 30, grain: 20, buildTimeSeconds: 80 },
  ],
  [BuildingType.WAREHOUSE]: [
    /* … */
  ],
  [BuildingType.GRANARY]: [
    /* … */
  ],
  [BuildingType.MARKET]: [
    /* … */
  ],
  [BuildingType.BARRACKS]: [
    /* … */
  ],
  [BuildingType.STABLE]: [
    /* … */
  ],
  [BuildingType.WORKSHOP]: [
    /* … */
  ],
  [BuildingType.WALL]: [
    /* … */
  ],
  [BuildingType.TOWER]: [
    /* … */
  ],
  [BuildingType.SMITHY]: [
    /* … */
  ],
  [BuildingType.EMBASSY]: [
    /* … */
  ],
  [BuildingType.ACADEMY]: [
    /* … */
  ],
  [BuildingType.SHRINE]: [
    /* … */
  ],
};

// Convert buildTimeSeconds to milliseconds per level
export const BUILD_TIMES_MS: Record<BuildingType, number[]> =
  Object.fromEntries(
    Object.entries(BUILDING_COSTS).map(([type, costs]) => [
      type,
      costs.map((c) => c.buildTimeSeconds * 1000),
    ]),
  ) as Record<BuildingType, number[]>;
