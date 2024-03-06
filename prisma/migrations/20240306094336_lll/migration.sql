/*
  Warnings:

  - Added the required column `attacker_fid` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defender_fid` to the `Battle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Battle` ADD COLUMN `attacker_fid` INTEGER NOT NULL,
    ADD COLUMN `defender_fid` INTEGER NOT NULL;
