/*
  Warnings:

  - You are about to drop the column `friend` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `friend_name` on the `Battle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Battle` DROP COLUMN `friend`,
    DROP COLUMN `friend_name`;

-- AlterTable
ALTER TABLE `BattleDetail` ADD COLUMN `critical` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `friend_name` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `friend` VARCHAR(191) NOT NULL DEFAULT '';
