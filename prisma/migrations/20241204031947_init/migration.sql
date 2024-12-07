/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Item` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ALTER COLUMN `password` DROP DEFAULT,
    ALTER COLUMN `email` DROP DEFAULT,
    ALTER COLUMN `uuid` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Item_name_key` ON `Item`(`name`);
