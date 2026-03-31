-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `image` VARCHAR(2048) NULL,
    `handle` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(500) NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_handle_key`(`handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApiToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastUsedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ApiToken_tokenHash_key`(`tokenHash`),
    INDEX `ApiToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ApiToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CliTool` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `version` VARCHAR(191) NULL,
    `homepage` VARCHAR(2048) NULL,
    `repository` VARCHAR(2048) NULL,
    `license` VARCHAR(191) NULL,
    `categories` TEXT NOT NULL,
    `tags` TEXT NOT NULL,
    `installMethod` VARCHAR(191) NULL,
    `installPackage` VARCHAR(191) NULL,
    `binaryName` VARCHAR(191) NULL,
    `runExample` TEXT NULL,
    `agentHints` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `authorId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `installCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `CliTool_slug_key`(`slug`),
    INDEX `CliTool_authorId_idx`(`authorId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `CliTool_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
