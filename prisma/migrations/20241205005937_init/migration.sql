-- AddForeignKey
ALTER TABLE `Borrow` ADD CONSTRAINT `Borrow_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
