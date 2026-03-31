-- Drop email verification columns (no longer used)
DROP INDEX `User_emailVerifyTokenHash_idx` ON `User`;
ALTER TABLE `User` DROP COLUMN `emailVerifyTokenHash`;
ALTER TABLE `User` DROP COLUMN `emailVerifyExpires`;
ALTER TABLE `User` DROP COLUMN `emailVerifiedAt`;

-- OAuth users have no password
ALTER TABLE `User` MODIFY `password` VARCHAR(191) NULL;
