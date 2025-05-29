/*
  Warnings:

  - Added the required column `remaining` to the `TrainingTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrainingTask" ADD COLUMN     "remaining" INTEGER NOT NULL;
