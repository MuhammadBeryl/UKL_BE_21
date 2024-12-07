/*
  Warnings:

  - Added the required column `userId` to the `Borrow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `borrow` ADD COLUMN `userId` INTEGER NOT NULL;
