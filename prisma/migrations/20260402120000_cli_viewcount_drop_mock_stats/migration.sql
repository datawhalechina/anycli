-- AlterTable: 站内访问计数；移除虚构的 install/star 列
ALTER TABLE `CliTool` ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `CliTool` DROP COLUMN `installCount`;
ALTER TABLE `CliTool` DROP COLUMN `starCount`;
