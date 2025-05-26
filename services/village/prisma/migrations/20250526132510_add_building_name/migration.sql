-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('SAWMILL', 'CLAY_PIT', 'IRON_MINE', 'FARM', 'WAREHOUSE', 'GRANARY', 'MARKET', 'BARRACKS', 'STABLE', 'WORKSHOP', 'WALL', 'TOWER', 'SMITHY', 'EMBASSY', 'ACADEMY', 'SHRINE');

-- CreateTable
CREATE TABLE "Village" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "x" INTEGER,
    "y" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerName" TEXT NOT NULL,
    "resourceAmounts" JSONB NOT NULL DEFAULT '{"wood":500,"clay":500,"iron":500,"grain":500}',
    "resourceProductionRates" JSONB NOT NULL DEFAULT '{"wood":10,"clay":10,"iron":10,"grain":8}',
    "lastCollectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "type" "BuildingType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "queuedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionTask" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "type" "BuildingType" NOT NULL,
    "level" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstructionTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Building_villageId_idx" ON "Building"("villageId");

-- CreateIndex
CREATE INDEX "ConstructionTask_villageId_idx" ON "ConstructionTask"("villageId");

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConstructionTask" ADD CONSTRAINT "ConstructionTask_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
