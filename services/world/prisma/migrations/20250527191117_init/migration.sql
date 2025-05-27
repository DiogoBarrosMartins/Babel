-- CreateEnum
CREATE TYPE "TileType" AS ENUM ('VILLAGE', 'OUTPOST', 'EMPTY', 'SHRINE');

-- CreateTable
CREATE TABLE "Tile" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" INTEGER NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tile_x_y_key" ON "Tile"("x", "y");

-- CreateIndex
CREATE UNIQUE INDEX "World_name_key" ON "World"("name");
