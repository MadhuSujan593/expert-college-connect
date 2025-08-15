-- Migration: Initial Schema Setup
-- Description: Creates all tables for the Expert College Connect system
-- Date: 2024-01-01

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- USER MANAGEMENT TABLES
-- ========================================

-- Users table
CREATE TABLE `User` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `password` VARCHAR(255) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
  `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
  `emailVerifiedAt` DATETIME(3) NULL,
  `phoneVerifiedAt` DATETIME(3) NULL,
  `lastLoginAt` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `isDeleted` BOOLEAN NOT NULL DEFAULT false,
  `role` ENUM('USER', 'EXPERT', 'COLLEGE_ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
  `profileImage` VARCHAR(500) NULL,
  `timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC',
  `language` VARCHAR(10) NOT NULL DEFAULT 'en',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `deletedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- EXPERT PROFILE TABLES
-- ========================================

-- Expert profiles table
CREATE TABLE `ExpertProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `jobTitle` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `experience` VARCHAR(100) NULL,
  `location` VARCHAR(255) NULL,
  `website` VARCHAR(500) NULL,
  `primaryExpertise` VARCHAR(255) NULL,
  `bio` TEXT NULL,
  `hourlyRate` DECIMAL(10,2) NULL,
  `availableFor` JSON NULL,
  `preferredMode` VARCHAR(100) NULL,
  `isProfileComplete` BOOLEAN NOT NULL DEFAULT false,
  `isVerified` BOOLEAN NOT NULL DEFAULT false,
  `verificationDate` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ExpertProfile_userId_key` (`userId`),
  INDEX `ExpertProfile_primaryExpertise_idx` (`primaryExpertise`),
  INDEX `ExpertProfile_location_idx` (`location`),
  INDEX `ExpertProfile_isVerified_idx` (`isVerified`),
  INDEX `ExpertProfile_hourlyRate_idx` (`hourlyRate`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Expert skills table
CREATE TABLE `ExpertSkill` (
  `id` VARCHAR(191) NOT NULL,
  `expertProfileId` VARCHAR(191) NOT NULL,
  `skillName` VARCHAR(255) NOT NULL,
  `skillLevel` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NOT NULL DEFAULT 'INTERMEDIATE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ExpertSkill_expertProfileId_idx` (`expertProfileId`),
  INDEX `ExpertSkill_skillName_idx` (`skillName`),
  INDEX `ExpertSkill_skillLevel_idx` (`skillLevel`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- COLLEGE PROFILE TABLES
-- ========================================

-- College profiles table
CREATE TABLE `CollegeProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `institutionName` VARCHAR(255) NOT NULL,
  `contactPersonName` VARCHAR(255) NOT NULL,
  `institutionType` ENUM('UNIVERSITY', 'COLLEGE', 'INSTITUTE', 'SCHOOL', 'OTHER') NOT NULL DEFAULT 'UNIVERSITY',
  `accreditation` VARCHAR(500) NULL,
  `website` VARCHAR(500) NULL,
  `address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `country` VARCHAR(100) NULL,
  `postalCode` VARCHAR(20) NULL,
  `phone` VARCHAR(20) NULL,
  `isProfileComplete` BOOLEAN NOT NULL DEFAULT false,
  `isVerified` BOOLEAN NOT NULL DEFAULT false,
  `verificationDate` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `CollegeProfile_userId_key` (`userId`),
  INDEX `CollegeProfile_institutionName_idx` (`institutionName`),
  INDEX `CollegeProfile_city_idx` (`city`),
  INDEX `CollegeProfile_state_idx` (`state`),
  INDEX `CollegeProfile_country_idx` (`country`),
  INDEX `CollegeProfile_isVerified_idx` (`isVerified`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- AUTHENTICATION & SECURITY TABLES
-- ========================================

-- Sessions table
CREATE TABLE `Session` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `ipAddress` VARCHAR(45) NULL,
  `userAgent` TEXT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Session_token_key` (`token`),
  INDEX `Session_userId_idx` (`userId`),
  INDEX `Session_token_idx` (`token`),
  INDEX `Session_expiresAt_idx` (`expiresAt`),
  INDEX `Session_isActive_idx` (`isActive`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE `RefreshToken` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isRevoked` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `RefreshToken_token_key` (`token`),
  INDEX `RefreshToken_userId_idx` (`userId`),
  INDEX `RefreshToken_token_idx` (`token`),
  INDEX `RefreshToken_expiresAt_idx` (`expiresAt`),
  INDEX `RefreshToken_isRevoked_idx` (`isRevoked`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Password reset table
CREATE TABLE `PasswordReset` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(500) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isUsed` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `PasswordReset_token_key` (`token`),
  INDEX `PasswordReset_userId_idx` (`userId`),
  INDEX `PasswordReset_token_idx` (`token`),
  INDEX `PasswordReset_expiresAt_idx` (`expiresAt`),
  INDEX `PasswordReset_isUsed_idx` (`isUsed`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Email verification table
CREATE TABLE `EmailVerification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isUsed` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `EmailVerification_userId_idx` (`userId`),
  INDEX `EmailVerification_email_idx` (`email`),
  INDEX `EmailVerification_otp_idx` (`otp`),
  INDEX `EmailVerification_expiresAt_idx` (`expiresAt`),
  INDEX `EmailVerification_isUsed_idx` (`isUsed`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Phone verification table
CREATE TABLE `PhoneVerification` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isUsed` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `PhoneVerification_userId_idx` (`userId`),
  INDEX `PhoneVerification_phone_idx` (`phone`),
  INDEX `PhoneVerification_otp_idx` (`otp`),
  INDEX `PhoneVerification_expiresAt_idx` (`expiresAt`),
  INDEX `PhoneVerification_isUsed_idx` (`isUsed`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- SERVICES & REQUIREMENTS TABLES
-- ========================================

-- Services table
CREATE TABLE `Service` (
  `id` VARCHAR(191) NOT NULL,
  `expertProfileId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `priceType` ENUM('FIXED', 'HOURLY', 'DAILY', 'NEGOTIABLE') NOT NULL DEFAULT 'FIXED',
  `duration` INT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Service_expertProfileId_idx` (`expertProfileId`),
  INDEX `Service_category_idx` (`category`),
  INDEX `Service_subcategory_idx` (`subcategory`),
  INDEX `Service_price_idx` (`price`),
  INDEX `Service_isActive_idx` (`isActive`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Requirements table
CREATE TABLE `Requirement` (
  `id` VARCHAR(191) NOT NULL,
  `collegeProfileId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) NULL,
  `budget` DECIMAL(10,2) NULL,
  `budgetType` ENUM('FIXED', 'RANGE', 'NEGOTIABLE') NOT NULL DEFAULT 'FIXED',
  `deadline` DATETIME(3) NULL,
  `isUrgent` BOOLEAN NOT NULL DEFAULT false,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Requirement_collegeProfileId_idx` (`collegeProfileId`),
  INDEX `Requirement_category_idx` (`category`),
  INDEX `Requirement_subcategory_idx` (`subcategory`),
  INDEX `Requirement_budget_idx` (`budget`),
  INDEX `Requirement_deadline_idx` (`deadline`),
  INDEX `Requirement_isUrgent_idx` (`isUrgent`),
  INDEX `Requirement_isActive_idx` (`isActive`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- RATINGS & REVIEWS TABLES
-- ========================================

-- Ratings table
CREATE TABLE `Rating` (
  `id` VARCHAR(191) NOT NULL,
  `expertProfileId` VARCHAR(191) NOT NULL,
  `collegeProfileId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `review` TEXT NULL,
  `isAnonymous` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Rating_expertProfileId_idx` (`expertProfileId`),
  INDEX `Rating_collegeProfileId_idx` (`collegeProfileId`),
  INDEX `Rating_rating_idx` (`rating`),
  INDEX `Rating_createdAt_idx` (`createdAt`),
  CONSTRAINT `Rating_rating_check` CHECK (`rating` >= 1 AND `rating` <= 5)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- PAYMENTS & TRANSACTIONS TABLES
-- ========================================

-- Payments table
CREATE TABLE `Payment` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `paymentMethod` ENUM('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET', 'CRYPTO') NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `transactionId` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `completedAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Payment_transactionId_key` (`transactionId`),
  INDEX `Payment_userId_idx` (`userId`),
  INDEX `Payment_status_idx` (`status`),
  INDEX `Payment_transactionId_idx` (`transactionId`),
  INDEX `Payment_createdAt_idx` (`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ========================================
-- FOREIGN KEY CONSTRAINTS
-- ========================================

-- Expert profile foreign keys
ALTER TABLE `ExpertProfile` ADD CONSTRAINT `ExpertProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Expert skills foreign keys
ALTER TABLE `ExpertSkill` ADD CONSTRAINT `ExpertSkill_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `ExpertProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- College profile foreign keys
ALTER TABLE `CollegeProfile` ADD CONSTRAINT `CollegeProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Session foreign keys
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Refresh token foreign keys
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Password reset foreign keys
ALTER TABLE `PasswordReset` ADD CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Email verification foreign keys
ALTER TABLE `EmailVerification` ADD CONSTRAINT `EmailVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Phone verification foreign keys
ALTER TABLE `PhoneVerification` ADD CONSTRAINT `PhoneVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Service foreign keys
ALTER TABLE `Service` ADD CONSTRAINT `Service_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `ExpertProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Requirement foreign keys
ALTER TABLE `Requirement` ADD CONSTRAINT `Requirement_collegeProfileId_fkey` FOREIGN KEY (`collegeProfileId`) REFERENCES `CollegeProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Rating foreign keys
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `ExpertProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Payment foreign keys
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- User indexes
CREATE INDEX `User_email_idx` ON `User`(`email`);
CREATE INDEX `User_phone_idx` ON `User`(`phone`);
CREATE INDEX `User_role_idx` ON `User`(`role`);
CREATE INDEX `User_isActive_idx` ON `User`(`isActive`);
CREATE INDEX `User_createdAt_idx` ON `User`(`createdAt`);

-- Composite indexes for common queries
CREATE INDEX `User_role_active_idx` ON `User`(`role`, `isActive`);
CREATE INDEX `User_email_verified_idx` ON `User`(`email`, `isEmailVerified`);

-- ========================================
-- INITIAL DATA (OPTIONAL)
-- ========================================

-- Insert super admin user (password: Admin123!)
INSERT INTO `User` (
  `id`, 
  `email`, 
  `fullName`, 
  `password`, 
  `role`, 
  `isEmailVerified`, 
  `isPhoneVerified`, 
  `isActive`
) VALUES (
  'admin_001',
  'admin@expertconnect.com',
  'System Administrator',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8v.m',
  'SUPER_ADMIN',
  true,
  true,
  true
);

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

-- Verify all tables were created
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  DATA_LENGTH,
  INDEX_LENGTH
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN (
  'User', 'ExpertProfile', 'ExpertSkill', 'CollegeProfile',
  'Session', 'RefreshToken', 'PasswordReset', 'EmailVerification',
  'PhoneVerification', 'Service', 'Requirement', 'Rating', 'Payment'
)
ORDER BY TABLE_NAME; 