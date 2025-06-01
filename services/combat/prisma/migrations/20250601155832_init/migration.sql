-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "attackerVillageId" TEXT NOT NULL,
    "defenderVillageId" TEXT,
    "originX" INTEGER NOT NULL,
    "originY" INTEGER NOT NULL,
    "targetX" INTEGER NOT NULL,
    "targetY" INTEGER NOT NULL,
    "troops" JSONB NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleReport" (
    "battleId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "attackerLosses" JSONB NOT NULL,
    "defenderLosses" JSONB NOT NULL,
    "loot" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleReport_pkey" PRIMARY KEY ("battleId")
);

-- AddForeignKey
ALTER TABLE "BattleReport" ADD CONSTRAINT "BattleReport_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
