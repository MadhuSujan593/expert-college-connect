-- AlterTable
ALTER TABLE `collegeprofile` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `establishedYear` VARCHAR(100) NULL,
    ADD COLUMN `facilities` VARCHAR(500) NULL,
    ADD COLUMN `logoUrl` VARCHAR(500) NULL,
    ADD COLUMN `specialties` VARCHAR(500) NULL,
    ADD COLUMN `studentCount` VARCHAR(100) NULL;
