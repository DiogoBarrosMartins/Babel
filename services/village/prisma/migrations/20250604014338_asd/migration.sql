/*
  Warnings:

  - A unique constraint covering the columns `[villageId,troopType,status]` on the table `Troop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buildingType` to the `TrainingTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Troop_villageId_troopType_key";

-- AlterTable
ALTER TABLE "TrainingTask" ADD COLUMN     "buildingType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Village" ADD COLUMN     "combatState" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "ArmyMovement" (
    "id" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "originX" INTEGER NOT NULL,
    "originY" INTEGER NOT NULL,
    "targetX" INTEGER NOT NULL,
    "targetY" INTEGER NOT NULL,
    "troops" JSONB NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArmyMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Troop_villageId_troopType_status_key" ON "Troop"("villageId", "troopType", "status");
