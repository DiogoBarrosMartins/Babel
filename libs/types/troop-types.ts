export enum HumanTroop {
  MILITIA = 'HUMAN_MILITIA',
  LONGBOWMAN = 'HUMAN_LONGBOWMAN',
  PALADIN = 'HUMAN_PALADIN',
}

export enum OrcTroop {
  GRUNT = 'ORC_GRUNT',
  AXERIDER = 'ORC_AXERIDER',
  WARLORD = 'ORC_WARLORD',
}

export enum ElfTroop {
  SCOUT = 'ELF_SCOUT',
  DRUID = 'ELF_DRUID',
  BLADEMASTER = 'ELF_BLADEMASTER',
}

export enum UndeadTroop {
  SKELETON = 'UNDEAD_SKELETON',
  BANSHEE = 'UNDEAD_BANSHEE',
  DEATH_KNIGHT = 'UNDEAD_DEATH_KNIGHT',
}

export enum DwarfTroop {
  AXEWIELDER = 'DWARF_AXEWIELDER',
  GUNNER = 'DWARF_GUNNER',
  IRON_GUARDIAN = 'DWARF_IRON_GUARDIAN',
}

export type TroopKey =
  | HumanTroop
  | OrcTroop
  | ElfTroop
  | UndeadTroop
  | DwarfTroop;

export interface TroopDefinition {
  name: string;
  description: string;
  attack: number;
  defense: number;
  speed: number;
  carryCapacity: number;
  trainingTime: number;
  cost: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
  };
}

export const TROOP_DEFINITIONS: Record<TroopKey, TroopDefinition> = {
  [HumanTroop.MILITIA]: {
    name: 'Militia',
    description:
      'Peasant-soldiers, hastily trained to defend their homeland with pitchforks and grit.',
    attack: 30,
    defense: 25,
    speed: 5,
    carryCapacity: 20,
    trainingTime: 50,
    cost: { food: 40, wood: 20, stone: 10, gold: 5 },
  },
  [HumanTroop.LONGBOWMAN]: {
    name: 'Longbowman',
    description:
      'Elite archers trained in the art of war from childhood, feared for their deadly range.',
    attack: 50,
    defense: 20,
    speed: 6,
    carryCapacity: 15,
    trainingTime: 70,
    cost: { food: 60, wood: 70, stone: 10, gold: 30 },
  },
  [HumanTroop.PALADIN]: {
    name: 'Paladin',
    description:
      'Holy knights clad in gleaming armor, wielding divine might and unwavering resolve.',
    attack: 80,
    defense: 60,
    speed: 8,
    carryCapacity: 40,
    trainingTime: 120,
    cost: { food: 90, wood: 60, stone: 50, gold: 60 },
  },

  [UndeadTroop.SKELETON]: {
    name: 'Skeleton',
    description:
      'Animated bones that swarm the living. Weak alone, terrifying in numbers.',
    attack: 20,
    defense: 10,
    speed: 5,
    carryCapacity: 10,
    trainingTime: 30,
    cost: { food: 10, wood: 5, stone: 5, gold: 0 },
  },
  [UndeadTroop.BANSHEE]: {
    name: 'Banshee',
    description:
      'Spectral horrors whose wails shatter morale and drive enemies to madness.',
    attack: 40,
    defense: 30,
    speed: 7,
    carryCapacity: 5,
    trainingTime: 80,
    cost: { food: 30, wood: 10, stone: 20, gold: 40 },
  },
  [UndeadTroop.DEATH_KNIGHT]: {
    name: 'Death Knight',
    description:
      'Cursed champions risen from ancient battlefields, striking fear with each charge.',
    attack: 90,
    defense: 70,
    speed: 6,
    carryCapacity: 30,
    trainingTime: 140,
    cost: { food: 100, wood: 50, stone: 50, gold: 80 },
  },

  [OrcTroop.GRUNT]: {
    name: 'Grunt',
    description:
      'Muscle-bound footsoldiers who revel in the chaos of close combat.',
    attack: 40,
    defense: 25,
    speed: 4,
    carryCapacity: 25,
    trainingTime: 60,
    cost: { food: 50, wood: 30, stone: 30, gold: 10 },
  },
  [OrcTroop.AXERIDER]: {
    name: 'Axerider',
    description:
      'Mounted raiders who strike fast and vanish into the fog of war.',
    attack: 60,
    defense: 30,
    speed: 9,
    carryCapacity: 40,
    trainingTime: 90,
    cost: { food: 70, wood: 60, stone: 30, gold: 40 },
  },
  [OrcTroop.WARLORD]: {
    name: 'Warlord',
    description:
      'Towering juggernauts of iron and fury, commanding fear through brute strength.',
    attack: 100,
    defense: 80,
    speed: 6,
    carryCapacity: 50,
    trainingTime: 150,
    cost: { food: 120, wood: 80, stone: 60, gold: 70 },
  },

  [ElfTroop.SCOUT]: {
    name: 'Forest Scout',
    description:
      'Fleet-footed trackers who strike unseen and vanish like whispers.',
    attack: 25,
    defense: 15,
    speed: 10,
    carryCapacity: 10,
    trainingTime: 40,
    cost: { food: 30, wood: 30, stone: 10, gold: 10 },
  },
  [ElfTroop.DRUID]: {
    name: 'Druid',
    description:
      'Mystics who bend the forest’s will to their own, wielding roots and storms in battle.',
    attack: 45,
    defense: 40,
    speed: 7,
    carryCapacity: 20,
    trainingTime: 90,
    cost: { food: 70, wood: 40, stone: 30, gold: 30 },
  },
  [ElfTroop.BLADEMASTER]: {
    name: 'Blademaster',
    description:
      'Deadly sword-dancers who blur through the battlefield in a flurry of steel.',
    attack: 85,
    defense: 50,
    speed: 9,
    carryCapacity: 30,
    trainingTime: 130,
    cost: { food: 100, wood: 60, stone: 50, gold: 50 },
  },

  [DwarfTroop.AXEWIELDER]: {
    name: 'Axewielder',
    description:
      'Sturdy infantry who cleave through armor with forged steel and fearless grit.',
    attack: 50,
    defense: 45,
    speed: 4,
    carryCapacity: 20,
    trainingTime: 70,
    cost: { food: 60, wood: 40, stone: 40, gold: 20 },
  },
  [DwarfTroop.GUNNER]: {
    name: 'Gunner',
    description:
      'Marksmen armed with black powder—loud, lethal, and ruthlessly precise.',
    attack: 65,
    defense: 30,
    speed: 5,
    carryCapacity: 15,
    trainingTime: 100,
    cost: { food: 80, wood: 60, stone: 40, gold: 50 },
  },
  [DwarfTroop.IRON_GUARDIAN]: {
    name: 'Iron Guardian',
    description:
      'Living fortresses of mithril and fire—unmoving, unyielding, unbreakable.',
    attack: 70,
    defense: 90,
    speed: 3,
    carryCapacity: 25,
    trainingTime: 160,
    cost: { food: 110, wood: 70, stone: 100, gold: 80 },
  },
};
