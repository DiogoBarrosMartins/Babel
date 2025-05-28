/*
  Warnings:

  - A unique constraint covering the columns `[villageId,troopType]` on the table `Troop` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Troop_villageId_troopType_key" ON "Troop"("villageId", "troopType");
