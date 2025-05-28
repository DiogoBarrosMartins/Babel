export enum ResourceField {
  Food = 'food',
  Wood = 'wood',
  Stone = 'stone',
  Gold = 'gold',
}
export type ResourceMap = Record<ResourceField, number>;

export interface Resources extends Record<string, number> {
  food: number;
  wood: number;
  stone: number;
  gold: number;
}
