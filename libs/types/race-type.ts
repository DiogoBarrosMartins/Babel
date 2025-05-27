export enum Race {
  HUMAN = 'HUMAN',
  ORC = 'ORC',
  ELF = 'ELF',
  DWARF = 'DWARF',
  UNDEAD = 'UNDEAD',
}

export enum OutpostType {
  RESOURCE = 'RESOURCE',
  FORWARD = 'FORWARD',
  DEFENSIVE = 'DEFENSIVE',
  MAGICAL = 'MAGICAL',
  NEUTRAL = 'NEUTRAL',
}

export interface RaceOutpost {
  name: string;
  type: OutpostType;
  x: number;
  y: number;
}

export interface StaticRaceData {
  name: Race;
  description: string;
  traits: any;
  hubX: number;
  hubY: number;
  hubName: string;
  outposts: RaceOutpost[];
}

export const STATIC_RACES: StaticRaceData[] = [
  {
    name: Race.ORC,
    description: 'Savage warriors from the west.',
    traits: {},
    hubX: 10,
    hubY: 90,
    hubName: 'Skullcrush Hold',
    outposts: [
      { name: 'Wolfclaw Watch', type: OutpostType.FORWARD, x: 12, y: 85 },
      { name: 'Stonefang Camp', type: OutpostType.RESOURCE, x: 8, y: 88 },
      { name: 'Bloodhowl Den', type: OutpostType.DEFENSIVE, x: 10, y: 93 },
      { name: 'Dark Totem Grounds', type: OutpostType.MAGICAL, x: 6, y: 92 },
      { name: 'Rotfang Ridge', type: OutpostType.NEUTRAL, x: 13, y: 89 },
    ],
  },
  {
    name: Race.HUMAN,
    description: 'Versatile and ambitious settlers.',
    traits: {},
    hubX: 50,
    hubY: 10,
    hubName: 'Citadel of Dawn',
    outposts: [
      { name: 'Riverwatch Keep', type: OutpostType.RESOURCE, x: 52, y: 12 },
      { name: 'Eastguard Tower', type: OutpostType.FORWARD, x: 48, y: 8 },
      { name: 'Northwall Post', type: OutpostType.DEFENSIVE, x: 51, y: 13 },
      { name: 'Sanctum Hill', type: OutpostType.MAGICAL, x: 47, y: 11 },
      { name: 'Briarpoint', type: OutpostType.NEUTRAL, x: 53, y: 9 },
    ],
  },
  {
    name: Race.ELF,
    description: 'Ancient guardians of nature and magic.',
    traits: {},
    hubX: 80,
    hubY: 80,
    hubName: 'Silvergrove',
    outposts: [
      { name: 'Whisperwind Glade', type: OutpostType.RESOURCE, x: 82, y: 78 },
      { name: 'Moonlight Outpost', type: OutpostType.FORWARD, x: 78, y: 79 },
      { name: 'Thistlewood Watch', type: OutpostType.DEFENSIVE, x: 81, y: 83 },
      { name: 'Crystal Bloom', type: OutpostType.MAGICAL, x: 77, y: 81 },
      { name: 'Evershade Camp', type: OutpostType.NEUTRAL, x: 84, y: 80 },
    ],
  },
  {
    name: Race.DWARF,
    description: 'Master craftsmen of the mountains.',
    traits: {},
    hubX: 20,
    hubY: 20,
    hubName: 'Irondeep Bastion',
    outposts: [
      { name: 'Hammerfall Outpost', type: OutpostType.RESOURCE, x: 22, y: 21 },
      { name: 'Thorin’s Watch', type: OutpostType.FORWARD, x: 18, y: 19 },
      { name: 'Stonehelm Post', type: OutpostType.DEFENSIVE, x: 20, y: 23 },
      { name: 'Molten Forge', type: OutpostType.MAGICAL, x: 17, y: 22 },
      { name: 'Greyrock Ridge', type: OutpostType.NEUTRAL, x: 23, y: 20 },
    ],
  },
  {
    name: Race.UNDEAD,
    description: 'The relentless forces of decay and shadow.',
    traits: {},
    hubX: 90,
    hubY: 10,
    hubName: 'Cryptspire',
    outposts: [
      { name: 'Graveshade Post', type: OutpostType.FORWARD, x: 92, y: 12 },
      { name: 'Rotfang Camp', type: OutpostType.RESOURCE, x: 88, y: 9 },
      { name: 'Boneclutch Nest', type: OutpostType.DEFENSIVE, x: 90, y: 13 },
      { name: 'Soulrift Hollow', type: OutpostType.MAGICAL, x: 87, y: 11 },
      { name: 'Blackfog Vale', type: OutpostType.NEUTRAL, x: 93, y: 10 },
    ],
  },
];
