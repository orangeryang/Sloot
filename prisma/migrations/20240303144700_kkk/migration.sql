/*
  Warnings:

  - Added the required column `attacker_name` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defender_name` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `damage` to the `BattleDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Battle` ADD COLUMN `attacker_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `defender_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `friend_name` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `BattleDetail` ADD COLUMN `damage` INTEGER NOT NULL;
