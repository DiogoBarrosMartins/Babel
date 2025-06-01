export class AttackRequestDto {
  battleId: string;
  attackerVillageId: string;
  attackerPlayerId: string;
  origin: { x: number; y: number };
  target: { x: number; y: number };
  troops: { troopType: string; quantity: number }[];
  startTime: string;
  arrivalTime: string;
}
