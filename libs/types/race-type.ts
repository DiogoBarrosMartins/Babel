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

function generateUniqueCoordinates(
  used: Set<string>,
  centerX: number,
  centerY: number,
  spread: number,
): { x: number; y: number } {
  let attempts = 0;
  while (attempts < 100) {
    const x =
      centerX + Math.floor(Math.random() * spread) - Math.floor(spread / 2);
    const y =
      centerY + Math.floor(Math.random() * spread) - Math.floor(spread / 2);
    const key = `${x},${y}`;
    if (!used.has(key)) {
      used.add(key);
      console.log(`📍 Coordinates reserved at (${x}, ${y})`);
      return { x, y };
    }
    attempts++;
  }
  throw new Error('Failed to generate unique coordinates');
}

export function getStaticRaces(worldSize: number): StaticRaceData[] {
  const radius = Math.floor(worldSize / 3);
  const centerX = 0;
  const centerY = 0;
  const used = new Set<string>();

  const descriptions = {
    [Race.ORC]: 'Savage warriors from the west... (Orc desc)',
    [Race.HUMAN]: 'Versatile and ambitious settlers... (Human desc)',
    [Race.ELF]: 'Ancient guardians of nature... (Elf desc)',
    [Race.DWARF]: 'Master craftsmen of the mountains... (Dwarf desc)',
    [Race.UNDEAD]: 'The relentless forces of decay... (Undead desc)',
  };

  const hubNames = {
    [Race.ORC]: 'Skullcrush Hold',
    [Race.HUMAN]: 'Citadel of Dawn',
    [Race.ELF]: 'Silvergrove',
    [Race.DWARF]: 'Irondeep Bastion',
    [Race.UNDEAD]: 'Cryptspire',
  };

  const raceOutpostNames = {
    [Race.ORC]: [
      ['Wolfclaw Watch', OutpostType.FORWARD],
      ['Stonefang Camp', OutpostType.RESOURCE],
      ['Bloodhowl Den', OutpostType.DEFENSIVE],
      ['Dark Totem Grounds', OutpostType.MAGICAL],
      ['Rotfang Ridge', OutpostType.NEUTRAL],
    ],
    [Race.HUMAN]: [
      ['Riverwatch Keep', OutpostType.RESOURCE],
      ['Eastguard Tower', OutpostType.FORWARD],
      ['Northwall Post', OutpostType.DEFENSIVE],
      ['Sanctum Hill', OutpostType.MAGICAL],
      ['Briarpoint', OutpostType.NEUTRAL],
    ],
    [Race.ELF]: [
      ['Whisperwind Glade', OutpostType.RESOURCE],
      ['Moonlight Outpost', OutpostType.FORWARD],
      ['Thistlewood Watch', OutpostType.DEFENSIVE],
      ['Crystal Bloom', OutpostType.MAGICAL],
      ['Evershade Camp', OutpostType.NEUTRAL],
    ],
    [Race.DWARF]: [
      ['Hammerfall Outpost', OutpostType.RESOURCE],
      ['Thorin’s Watch', OutpostType.FORWARD],
      ['Stonehelm Post', OutpostType.DEFENSIVE],
      ['Molten Forge', OutpostType.MAGICAL],
      ['Greyrock Ridge', OutpostType.NEUTRAL],
    ],
    [Race.UNDEAD]: [
      ['Graveshade Post', OutpostType.FORWARD],
      ['Rotfang Camp', OutpostType.RESOURCE],
      ['Boneclutch Nest', OutpostType.DEFENSIVE],
      ['Soulrift Hollow', OutpostType.MAGICAL],
      ['Blackfog Vale', OutpostType.NEUTRAL],
    ],
  };

  const angleStep = (2 * Math.PI) / Object.keys(Race).length;

  return Object.values(Race).map((race, index) => {
    const angle = index * angleStep;
    const hubX = Math.round(centerX + radius * Math.cos(angle));
    const hubY = Math.round(centerY + radius * Math.sin(angle));
    const hubKey = `${hubX},${hubY}`;
    used.add(hubKey);
    console.log(
      `🏰 ${race} hub '${hubNames[race]}' placed at (${hubX}, ${hubY})`,
    );

    const outposts: RaceOutpost[] = raceOutpostNames[race].map(
      ([name, type]) => {
        const pos = generateUniqueCoordinates(used, hubX, hubY, 10);
        console.log(
          `🏕️ ${race} outpost '${name}' placed at (${pos.x}, ${pos.y})`,
        );
        return { name, type: type as OutpostType, x: pos.x, y: pos.y };
      },
    );

    return {
      name: race,
      description: descriptions[race],
      traits: {},
      hubX,
      hubY,
      hubName: hubNames[race],
      outposts,
    };
  });
}
