export interface CombatTroopLoss {
  troopType: string;
  lost: number;
  remaining: number;
}

export interface CombatLoot {
  food: number;
  wood: number;
  stone: number;
  gold: number;
}

export interface BattleReportPayload {
  battleId: string;
  outcome: 'VICTORY' | 'DEFEAT' | 'DRAW';
  attackerLosses: CombatTroopLoss[];
  defenderLosses: CombatTroopLoss[];
  loot: CombatLoot;
  notes?: string;
}
export interface ValidatedBattlePayload {
  attackerVillageId: string;
  origin: { x: number; y: number };
  target: { x: number; y: number };
  troops: { troopType: string; quantity: number }[];
  defenderVillageId: string;
}
