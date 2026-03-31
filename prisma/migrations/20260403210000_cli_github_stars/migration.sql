-- AlterTable
ALTER TABLE `CliTool` ADD COLUMN `githubStars` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `CliTool` ADD COLUMN `githubStarsUpdatedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `CliTool_githubStars_idx` ON `CliTool`(`githubStars`);
