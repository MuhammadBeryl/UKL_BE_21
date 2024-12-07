/*
  Warnings:

  - You are about to drop the column `borrowerName` on the `borrow` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `borrow` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `borrow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `borrow` DROP COLUMN `borrowerName`,
    DROP COLUMN `quantity`,
    DROP COLUMN `status`;
