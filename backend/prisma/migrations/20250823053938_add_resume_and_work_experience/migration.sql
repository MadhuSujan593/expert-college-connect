-- AlterTable
ALTER TABLE `expertprofile` ADD COLUMN `resumeUrl` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `workexperience` (
    `id` VARCHAR(191) NOT NULL,
    `expertProfileId` VARCHAR(191) NOT NULL,
    `jobTitle` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `skills` JSON NULL,
    `achievements` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkExperience_expertProfileId_idx`(`expertProfileId`),
    INDEX `WorkExperience_startDate_idx`(`startDate`),
    INDEX `WorkExperience_isCurrent_idx`(`isCurrent`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `workexperience` ADD CONSTRAINT `WorkExperience_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `expertprofile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
