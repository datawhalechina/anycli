-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;
ALTER TABLE `User` ADD COLUMN `emailVerifyTokenHash` VARCHAR(64) NULL;
ALTER TABLE `User` ADD COLUMN `emailVerifyExpires` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `User_emailVerifyTokenHash_idx` ON `User`(`emailVerifyTokenHash`);

-- 已有账号视为已验证，避免线上用户全部被拒登录
UPDATE `User` SET `emailVerifiedAt` = `createdAt` WHERE `emailVerifiedAt` IS NULL;
