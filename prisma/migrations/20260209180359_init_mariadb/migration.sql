-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'SUPERVISOR', 'ATTENDANT') NOT NULL DEFAULT 'ATTENDANT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `parentId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestLink` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `type` ENUM('QUICK', 'IDENTIFIED', 'UNIDENTIFIED') NOT NULL DEFAULT 'QUICK',
    `creatorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `cpfCnpj` VARCHAR(191) NULL,
    `config` JSON NULL,

    UNIQUE INDEX `TestLink_code_key`(`code`),
    INDEX `TestLink_creatorId_idx`(`creatorId`),
    INDEX `TestLink_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestResult` (
    `id` VARCHAR(191) NOT NULL,
    `testLinkId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cpfCnpj` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `ram` INTEGER NULL,
    `cpuCores` INTEGER NULL,
    `gpu` VARCHAR(191) NULL,
    `publicIp` VARCHAR(191) NULL,
    `localIp` VARCHAR(191) NULL,
    `ipv6` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NULL,
    `connectionType` VARCHAR(191) NULL,
    `downloadSpeed` DOUBLE NULL,
    `uploadSpeed` DOUBLE NULL,
    `ping` DOUBLE NULL,
    `jitter` DOUBLE NULL,
    `packetLoss` DOUBLE NULL,
    `pageLoadTime` DOUBLE NULL,
    `dnsTime` DOUBLE NULL,
    `canStream4k` BOOLEAN NOT NULL DEFAULT false,
    `canStreamHd` BOOLEAN NOT NULL DEFAULT false,
    `externalStatus` JSON NULL,

    INDEX `TestResult_testLinkId_idx`(`testLinkId`),
    INDEX `TestResult_createdAt_idx`(`createdAt`),
    INDEX `TestResult_cpfCnpj_idx`(`cpfCnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestLink` ADD CONSTRAINT `TestLink_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResult` ADD CONSTRAINT `TestResult_testLinkId_fkey` FOREIGN KEY (`testLinkId`) REFERENCES `TestLink`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
