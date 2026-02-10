/*
  Warnings:

  - You are about to drop the column `canStream4k` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `canStreamHd` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `dnsTime` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `downloadSpeed` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `ipv6` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `pageLoadTime` on the `TestResult` table. All the data in the column will be lost.
  - You are about to drop the column `uploadSpeed` on the `TestResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `TestResult` DROP COLUMN `canStream4k`,
    DROP COLUMN `canStreamHd`,
    DROP COLUMN `dnsTime`,
    DROP COLUMN `downloadSpeed`,
    DROP COLUMN `ipv6`,
    DROP COLUMN `pageLoadTime`,
    DROP COLUMN `uploadSpeed`,
    ADD COLUMN `browserVersion` VARCHAR(191) NULL,
    ADD COLUMN `downloadAvg` DOUBLE NULL,
    ADD COLUMN `downloadMax` DOUBLE NULL,
    ADD COLUMN `hdStatus` VARCHAR(191) NULL,
    ADD COLUMN `isIpv6` BOOLEAN NULL,
    ADD COLUMN `jitterStatus` VARCHAR(191) NULL,
    ADD COLUMN `liveStatus` VARCHAR(191) NULL,
    ADD COLUMN `mss` INTEGER NULL,
    ADD COLUMN `mtu` INTEGER NULL,
    ADD COLUMN `pageLoadMetrics` JSON NULL,
    ADD COLUMN `qualityLatency` DOUBLE NULL,
    ADD COLUMN `qualitySpeed` DOUBLE NULL,
    ADD COLUMN `sdStatus` VARCHAR(191) NULL,
    ADD COLUMN `signalStatus` VARCHAR(191) NULL,
    ADD COLUMN `status4k` VARCHAR(191) NULL,
    ADD COLUMN `ultraHdStatus` VARCHAR(191) NULL,
    ADD COLUMN `uploadAvg` DOUBLE NULL,
    ADD COLUMN `uploadMax` DOUBLE NULL,
    MODIFY `ram` VARCHAR(191) NULL;
