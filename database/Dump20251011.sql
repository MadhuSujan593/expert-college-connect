-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: expert_college_connect
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('3c3944ec-720f-420a-8e15-bd4937ef75ee','40387f021a071b48d788a1b5e2c553d312fbd145b584ed275ea8509941be7f2a','2025-10-02 08:10:25.409','20250823053938_add_resume_and_work_experience','',NULL,'2025-10-02 08:10:25.409',0),('80b1f26d-fecf-4015-b23e-04a1dd47f7e9','d57e1294038c3e6656133850787a49cb6dc9a864b63b4d4ca1c1c4f15f5eff9d','2025-10-02 08:10:55.392','20250824061730_add_college_profile_fields','',NULL,'2025-10-02 08:10:55.392',0),('dc6594f3-e70b-432d-b5e0-e38f1cab1fcc','502fb79057472a393b6e849223c5999a49e1d89a89865a6ae33ff31bc85594c8',NULL,'20250815121237_make_verification_userid_optional','A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250815121237_make_verification_userid_optional\n\nDatabase error code: 1146\n\nDatabase error:\nTable \'expert_college_connect.emailverification\' doesn\'t exist\n\nPlease check the query number 1 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name=\"20250815121237_make_verification_userid_optional\"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name=\"20250815121237_make_verification_userid_optional\"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:236',NULL,'2025-09-22 17:16:08.364',0),('f6606f99-d298-4e75-958c-d3864d67b21e','7a828fb9c12dfefc936ad3983d4843f7c8ce12c1e0eb1c40e92a5d3dc6ea98f2','2025-10-02 08:10:44.191','20250823083839_add_profile_picture_field','',NULL,'2025-10-02 08:10:44.191',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application`
--

DROP TABLE IF EXISTS `application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirementId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expertId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','SHORTLISTED','REJECTED','ACCEPTED','WITHDRAWN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `coverLetter` text COLLATE utf8mb4_unicode_ci,
  `proposedBudget` decimal(10,2) DEFAULT NULL,
  `proposedTimeline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `relevantExperience` text COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `isShortlisted` tinyint(1) NOT NULL DEFAULT '0',
  `shortlistedAt` datetime(3) DEFAULT NULL,
  `reviewedAt` datetime(3) DEFAULT NULL,
  `reviewedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewNotes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Application_requirementId_idx` (`requirementId`),
  KEY `Application_expertId_idx` (`expertId`),
  KEY `Application_status_idx` (`status`),
  KEY `Application_createdAt_idx` (`createdAt`),
  CONSTRAINT `application_expertId_fkey` FOREIGN KEY (`expertId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `application_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirement` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application`
--

LOCK TABLES `application` WRITE;
/*!40000 ALTER TABLE `application` DISABLE KEYS */;
INSERT INTO `application` VALUES ('cmg7oywod00010mmkbosmzo3t','cmg7j9t6s00030m5s1cpa319d','3d58c965-00f0-4919-bc4d-36d5314fe67f','SHORTLISTED','',NULL,NULL,NULL,NULL,1,'2025-10-01 08:00:01.894','2025-10-01 08:00:01.894','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','','2025-10-01 07:55:30.152','2025-10-01 07:55:30.150'),('cmg7p53wz00070mmkbzro2nts','cmg7mk3tc00030mwoxomtt3f1','3d58c965-00f0-4919-bc4d-36d5314fe67f','SHORTLISTED','',NULL,NULL,NULL,NULL,1,'2025-10-01 09:35:17.202','2025-10-01 09:35:17.202','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','','2025-10-01 08:00:19.475','2025-10-01 08:00:19.467'),('cmgbw3vjq00010mvkb2gtklc5','cmg9anmka00050me45moeri6n','3d58c965-00f0-4919-bc4d-36d5314fe67f','PENDING','',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'2025-10-04 06:26:23.987','2025-10-04 06:26:23.987'),('cmgc25uz600070mg0xj3b7ic7','cmgby98ht00090ml0rah798sf','3d58c965-00f0-4919-bc4d-36d5314fe67f','PENDING','',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'2025-10-04 09:15:54.258','2025-10-04 09:15:54.255'),('cmgc26ezd000b0mg0din3grcp','cmgby84h900070ml0eb26a2o7','3d58c965-00f0-4919-bc4d-36d5314fe67f','PENDING','',NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'2025-10-04 09:16:20.185','2025-10-04 09:16:20.182');
/*!40000 ALTER TABLE `application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collegeprofile`
--

DROP TABLE IF EXISTS `collegeprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collegeprofile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institutionName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactPersonName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institutionType` enum('UNIVERSITY','COLLEGE','INSTITUTE','SCHOOL','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNIVERSITY',
  `accreditation` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postalCode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `isProfileComplete` tinyint(1) NOT NULL DEFAULT '0',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `verificationDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CollegeProfile_userId_key` (`userId`),
  KEY `CollegeProfile_city_idx` (`city`),
  KEY `CollegeProfile_country_idx` (`country`),
  KEY `CollegeProfile_institutionName_idx` (`institutionName`),
  KEY `CollegeProfile_isVerified_idx` (`isVerified`),
  KEY `CollegeProfile_state_idx` (`state`),
  CONSTRAINT `CollegeProfile_userId_key` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collegeprofile`
--

LOCK TABLES `collegeprofile` WRITE;
/*!40000 ALTER TABLE `collegeprofile` DISABLE KEYS */;
INSERT INTO `collegeprofile` VALUES ('0e9798a3-fc2d-4d67-8b0d-5e81e09edb56','0ca8e031-2298-4443-9b3f-8fbe3ec6cd31','JNTUA','Sam','UNIVERSITY',NULL,'','','','','','',NULL,NULL,NULL,0,0,NULL,'2025-09-27 17:29:48.415','2025-09-27 17:29:48.413'),('448c6405-6f63-4533-85c4-c270ad36e244','0981e10a-c1f1-4988-8459-3fbefc0a591f','SVU','ESwar','UNIVERSITY',NULL,'','','','','','',NULL,NULL,NULL,0,0,NULL,'2025-09-27 17:33:16.325','2025-09-27 17:33:16.323'),('48159599-ced3-44e6-8706-e0e474bf4e31','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','Annamacharya','Jerry','UNIVERSITY','A','Not specifiedszc xzcxx  x','xc x z','Chennai','dvdc','vdxv','','+91770221111123','http://localhost:3000/uploads/profile-pics/college-logo-1759649971549-812919906.jpeg','cdcxcxcx',0,0,NULL,'2025-09-22 17:35:03.337','2025-10-05 07:39:31.616'),('86a3ba61-4642-4bf9-ab93-6c88e1c387b6','84079f20-ff49-4cef-a6f8-9a9bd52e6549','SVU','test','UNIVERSITY',NULL,'','','','','','',NULL,NULL,NULL,0,0,NULL,'2025-09-28 06:16:02.484','2025-09-28 06:16:02.486'),('d34e58e3-db33-4b54-bc5e-894626123363','54f3a261-9dd1-4a70-ad85-78f9395af57e','AA','Madhu','UNIVERSITY',NULL,'','','','','','',NULL,NULL,NULL,0,0,NULL,'2025-09-27 17:25:11.891','2025-09-27 17:25:11.887'),('e7d7af75-4640-44cb-80b6-601e2a0b6749','7566d1f0-4c85-4357-bede-738182673d47','AA','Sam','UNIVERSITY',NULL,'','','','','','',NULL,NULL,NULL,0,0,NULL,'2025-09-28 05:44:58.246','2025-09-28 05:44:58.252');
/*!40000 ALTER TABLE `collegeprofile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emailverification`
--

DROP TABLE IF EXISTS `emailverification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emailverification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EmailVerification_email_idx` (`email`),
  KEY `EmailVerification_expiresAt_idx` (`expiresAt`),
  KEY `EmailVerification_isUsed_idx` (`isUsed`),
  KEY `EmailVerification_otp_idx` (`otp`),
  KEY `EmailVerification_userId_idx` (`userId`),
  CONSTRAINT `EmailVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emailverification`
--

LOCK TABLES `emailverification` WRITE;
/*!40000 ALTER TABLE `emailverification` DISABLE KEYS */;
INSERT INTO `emailverification` VALUES ('cmg39mtxz00010mpk2n38txtv','37d6b548-215b-4459-b91b-11633a2b84ad','mahesh123@gmail.com','353262','2025-09-28 05:45:07.799',0,'2025-09-28 05:35:07.798',NULL),('cmg39vnic00030mpkih1ec0rb','fd9c978d-9e49-4ec6-a057-a951fc1d6a9b','jason@gmail.com','825788','2025-09-28 05:51:59.361',1,'2025-09-28 05:41:59.364','2025-09-28 05:42:23.881'),('cmg39zosd00050mpkgohlbn9y','7566d1f0-4c85-4357-bede-738182673d47','sam123@gmail.com','895149','2025-09-28 06:01:24.257',1,'2025-09-28 05:45:07.645','2025-09-28 05:53:05.977'),('cmg3ang4g00070mpkyszz55x9','4615a45b-9ac6-4259-a660-8f6a9209970d','ma@gmail.com','908261','2025-09-28 06:13:36.149',1,'2025-09-28 06:03:36.160','2025-09-28 06:04:02.778'),('cmg3auv4c00010mpc6yp9djbw','4615a45b-9ac6-4259-a660-8f6a9209970d','ma@gmail.com','576344','2025-09-28 06:19:22.186',1,'2025-09-28 06:09:22.187','2025-09-28 06:09:56.969'),('cmg3azurz00030mpcr6cl71ru','4615a45b-9ac6-4259-a660-8f6a9209970d','ma@gmail.com','136360','2025-09-28 06:23:15.019',1,'2025-09-28 06:13:15.023','2025-09-28 06:13:39.754'),('cmg3ba3h500070mpc29mlku9x','84079f20-ff49-4cef-a6f8-9a9bd52e6549','mat@gmail.com','749223','2025-09-28 06:31:12.856',1,'2025-09-28 06:21:12.858','2025-09-28 06:21:33.644');
/*!40000 ALTER TABLE `emailverification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expertprofile`
--

DROP TABLE IF EXISTS `expertprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expertprofile` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobTitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `experience` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primaryExpertise` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `hourlyRate` decimal(10,2) DEFAULT NULL,
  `availableFor` json DEFAULT NULL,
  `preferredMode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resumeUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profilePicture` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isProfileComplete` tinyint(1) NOT NULL DEFAULT '0',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `verificationDate` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ExpertProfile_userId_key` (`userId`),
  KEY `ExpertProfile_hourlyRate_idx` (`hourlyRate`),
  KEY `ExpertProfile_isVerified_idx` (`isVerified`),
  KEY `ExpertProfile_location_idx` (`location`),
  KEY `ExpertProfile_primaryExpertise_idx` (`primaryExpertise`),
  CONSTRAINT `ExpertProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expertprofile`
--

LOCK TABLES `expertprofile` WRITE;
/*!40000 ALTER TABLE `expertprofile` DISABLE KEYS */;
INSERT INTO `expertprofile` VALUES ('164d9097-08d1-4a76-8f25-93ee5356c8a8','4615a45b-9ac6-4259-a660-8f6a9209970d','Software engineer','Micorsoft','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-09-28 06:01:48.994','2025-09-28 06:01:48.993'),('4eb1a58d-3f2b-4375-b44f-2fc1750ea57f','237162ea-f15e-47d9-91e0-baf6ccc026cf','test','Test','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-09-27 17:32:16.750','2025-09-27 17:32:16.744'),('4f88534d-a871-41b1-9610-f021c53355c0','13adcfc8-f2ae-481d-bbea-4f51f94b20e8','Software engineer','Softsuave','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-09-28 05:29:04.305','2025-09-28 05:29:04.313'),('539f81bb-9d54-44ed-b601-0f4cae15b378','1251518b-d407-4c6c-8431-df04fca85fd0','Test','test','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-10-04 06:21:36.412','2025-10-04 06:21:36.410'),('5d8ec8f2-9275-4dbd-b1cf-dde6d9170b8d','fd9c978d-9e49-4ec6-a057-a951fc1d6a9b','Software engineer','Softsuave','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-09-28 05:41:53.512','2025-09-28 05:41:53.511'),('c08a8a65-3490-4859-bdae-acc07a946881','37d6b548-215b-4459-b91b-11633a2b84ad','Software engineer','Softsuave','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-09-28 05:35:02.319','2025-09-28 05:35:02.320'),('ecd8e323-62e8-497d-9fe6-1b362435f12e','3d58c965-00f0-4919-bc4d-36d5314fe67f','Software engineer','Softsuave','',NULL,NULL,'','',NULL,'[\"Data Science & AI\", \"Cybersecurity\", \"Software Development\", \"Innovation & Design\"]','','http://localhost:3000/uploads/resumes/1759559220347-317380360.pdf','http://localhost:3000/uploads/profile-pics/1759307639653-10049063.jpeg',1,0,NULL,'2025-09-22 17:26:19.981','2025-09-22 17:26:19.979'),('f67b4f5f-ec0e-4f6c-b8fa-4b0763adec2a','93db1c98-1820-4743-8c9c-f2212f6dcb00','SS','Test','',NULL,NULL,'','',NULL,'null','',NULL,NULL,0,0,NULL,'2025-09-22 17:29:29.007','2025-09-22 17:29:29.006');
/*!40000 ALTER TABLE `expertprofile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expertskill`
--

DROP TABLE IF EXISTS `expertskill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expertskill` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expertProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skillName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skillLevel` enum('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INTERMEDIATE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ExpertSkill_expertProfileId_fkey` (`expertProfileId`),
  KEY `ExpertSkill_skillLevel_idx` (`skillLevel`),
  KEY `ExpertSkill_skillName_idx` (`skillName`),
  CONSTRAINT `ExpertSkill_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `expertprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expertskill`
--

LOCK TABLES `expertskill` WRITE;
/*!40000 ALTER TABLE `expertskill` DISABLE KEYS */;
INSERT INTO `expertskill` VALUES ('3d0f1a3e-a860-4e76-9b22-c7a59ffed99a','ecd8e323-62e8-497d-9fe6-1b362435f12e','data structure','BEGINNER','2025-10-04 18:23:11.462'),('8997cffc-d8cf-4660-9859-e2365dc2b00b','ecd8e323-62e8-497d-9fe6-1b362435f12e','Sql','BEGINNER','2025-10-04 18:20:34.246'),('8e5b629b-175d-4a90-a5d2-d4e5978d2c38','ecd8e323-62e8-497d-9fe6-1b362435f12e','Java','INTERMEDIATE','2025-10-04 06:23:21.817'),('fcaacbbc-8dce-49ab-88ca-55609b80a1d5','ecd8e323-62e8-497d-9fe6-1b362435f12e','python','BEGINNER','2025-10-04 18:20:25.522');
/*!40000 ALTER TABLE `expertskill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiverId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Message_senderId_idx` (`senderId`),
  KEY `Message_receiverId_idx` (`receiverId`),
  KEY `Message_isRead_idx` (`isRead`),
  KEY `Message_createdAt_idx` (`createdAt`),
  CONSTRAINT `message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('APPLICATION_SUBMITTED','APPLICATION_STATUS_UPDATED','APPLICATION_SHORTLISTED','APPLICATION_REJECTED','APPLICATION_ACCEPTED','MESSAGE_RECEIVED','REQUIREMENT_POSTED','REQUIREMENT_UPDATED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_idx` (`userId`),
  KEY `Notification_applicationId_idx` (`applicationId`),
  KEY `Notification_isRead_idx` (`isRead`),
  KEY `Notification_createdAt_idx` (`createdAt`),
  CONSTRAINT `notification_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES ('cmg7oywp000030mmkal5kj5x2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmg7oywod00010mmkbosmzo3t','APPLICATION_SUBMITTED','New Expert Application','A new expert has applied for your requirement: \"Java edited\"',0,NULL,'2025-10-01 07:55:30.181'),('cmg7p4qex00050mmkw9bisnks','3d58c965-00f0-4919-bc4d-36d5314fe67f','cmg7oywod00010mmkbosmzo3t','APPLICATION_STATUS_UPDATED','Application Status Updated','Your application for \"Java edited\" has been shortlisted',0,NULL,'2025-10-01 08:00:01.973'),('cmg7p53y200090mmkbwvs4ldv','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmg7p53wz00070mmkbzro2nts','APPLICATION_SUBMITTED','New Expert Application','A new expert has applied for your requirement: \"New\"',0,NULL,'2025-10-01 08:00:19.511'),('cmg7pqxrp000b0mmkpe0q3lxz','3d58c965-00f0-4919-bc4d-36d5314fe67f','cmg7p53wz00070mmkbzro2nts','APPLICATION_STATUS_UPDATED','Application Status Updated','Your application for \"New\" has been pending',0,NULL,'2025-10-01 08:17:17.938'),('cmg7pud5m000d0mmk8masdjx5','3d58c965-00f0-4919-bc4d-36d5314fe67f','cmg7p53wz00070mmkbzro2nts','APPLICATION_STATUS_UPDATED','Application Status Updated','Your application for \"New\" has been rejected',0,NULL,'2025-10-01 08:19:57.848'),('cmg7sj8du00010mu0vluk0hrx','3d58c965-00f0-4919-bc4d-36d5314fe67f','cmg7p53wz00070mmkbzro2nts','APPLICATION_STATUS_UPDATED','Application Status Updated','Your application for \"New\" has been shortlisted',0,NULL,'2025-10-01 09:35:17.294'),('cmgbw3vkf00030mvkgwc3x4i7','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmgbw3vjq00010mvkb2gtklc5','APPLICATION_SUBMITTED','New Expert Application','A new expert has applied for your requirement: \"MMNHH\"',0,NULL,'2025-10-04 06:26:24.015'),('cmgc25uzp00090mg0mpachdui','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmgc25uz600070mg0xj3b7ic7','APPLICATION_SUBMITTED','New Expert Application','A new expert has applied for your requirement: \"dvdvd\"',0,NULL,'2025-10-04 09:15:54.278'),('cmgc26ezt000d0mg0hlbjjnv8','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmgc26ezd000b0mg0din3grcp','APPLICATION_SUBMITTED','New Expert Application','A new expert has applied for your requirement: \"zscs\"',0,NULL,'2025-10-04 09:16:20.201');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passwordreset`
--

DROP TABLE IF EXISTS `passwordreset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passwordreset` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PasswordReset_token_key` (`token`),
  KEY `PasswordReset_expiresAt_idx` (`expiresAt`),
  KEY `PasswordReset_isUsed_idx` (`isUsed`),
  KEY `PasswordReset_token_idx` (`token`),
  KEY `PasswordReset_userId_idx` (`userId`),
  CONSTRAINT `PasswordReset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passwordreset`
--

LOCK TABLES `passwordreset` WRITE;
/*!40000 ALTER TABLE `passwordreset` DISABLE KEYS */;
INSERT INTO `passwordreset` VALUES ('68ae729b-bed2-461d-b1c9-7907e894c2bc','0981e10a-c1f1-4988-8459-3fbefc0a591f','914693','2025-09-27 17:53:51.702',0,'2025-09-27 17:43:51.706',NULL),('774b3e13-6a99-4e34-af86-084be415f21a','0981e10a-c1f1-4988-8459-3fbefc0a591f','0fdf231acf8c61fee662dbbbc2d8d8ea79c8772b63bce43760b1a245844284dd','2025-09-27 18:00:02.237',1,'2025-09-27 17:41:57.609','2025-09-27 17:46:40.584');
/*!40000 ALTER TABLE `passwordreset` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `paymentMethod` enum('CREDIT_CARD','DEBIT_CARD','BANK_TRANSFER','DIGITAL_WALLET','CRYPTO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `transactionId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `completedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_transactionId_key` (`transactionId`),
  KEY `Payment_createdAt_idx` (`createdAt`),
  KEY `Payment_status_idx` (`status`),
  KEY `Payment_transactionId_idx` (`transactionId`),
  KEY `Payment_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES ('pay_1759341208674_yqpww6s74','2df9c72d-cc27-496f-9e97-44ab6f2d65cf',500.00,'INR','DIGITAL_WALLET','COMPLETED','pay_ROIXV8s8SkuZ3X','Subscription payment for Silver plan plan','{\"razorpay_order_id\": \"order_ROIWnP1MrcEe95\", \"razorpay_signature\": \"178d0caa4f3aa937657f750ea707f06a36ae834fed9dff44f4510a06919420d7\", \"razorpay_payment_id\": \"pay_ROIXV8s8SkuZ3X\"}','2025-10-01 17:53:28.514','2025-10-01 17:53:28.514','2025-10-01 17:53:28.514'),('pay_1759341781214_zm9c8kj5p','2df9c72d-cc27-496f-9e97-44ab6f2d65cf',5000.00,'INR','DIGITAL_WALLET','COMPLETED','pay_ROIhb1RXjWgjuv','Subscription payment for Gold Plan plan','{\"razorpay_order_id\": \"order_ROIgzvffejPqmF\", \"razorpay_signature\": \"3cf9f24118e4a0a0c1f33a5ef895af03a9cb39a3980db30134901ab9f834bca5\", \"razorpay_payment_id\": \"pay_ROIhb1RXjWgjuv\"}','2025-10-01 18:03:01.139','2025-10-01 18:03:01.139','2025-10-01 18:03:01.139'),('pay_1759342381747_rqc5ttg3g','2df9c72d-cc27-496f-9e97-44ab6f2d65cf',0.00,'INR','DIGITAL_WALLET','COMPLETED','free_plan_1759342381628','Subscription payment for Free Plan plan','{\"razorpay_order_id\": \"free_order_1759342381628\", \"razorpay_signature\": \"free_signature_1759342381628\", \"razorpay_payment_id\": \"free_plan_1759342381628\"}','2025-10-01 18:13:01.640','2025-10-01 18:13:01.640','2025-10-01 18:13:01.640'),('pay_1759559719951_3bfu7uq6o','2df9c72d-cc27-496f-9e97-44ab6f2d65cf',500.00,'INR','DIGITAL_WALLET','COMPLETED','pay_RPIaQ8uV50YOBx','Subscription payment for Silver plan plan','{\"razorpay_order_id\": \"order_RPIZdtvXFkmg04\", \"razorpay_signature\": \"fd16d0bc6efe82d3a3041e38ac93411089300bac7072f22fec04ae0cedd3b05e\", \"razorpay_payment_id\": \"pay_RPIaQ8uV50YOBx\"}','2025-10-04 06:35:19.560','2025-10-04 06:35:19.560','2025-10-04 06:35:19.560'),('pay_1759569326681_7a27l1h9q','3d58c965-00f0-4919-bc4d-36d5314fe67f',0.00,'INR','DIGITAL_WALLET','COMPLETED','free_plan_1759569326641','Subscription payment for Free plan','{\"razorpay_order_id\": \"free_order_1759569326641\", \"razorpay_signature\": \"free_signature_1759569326641\", \"razorpay_payment_id\": \"free_plan_1759569326641\"}','2025-10-04 09:15:26.648','2025-10-04 09:15:26.648','2025-10-04 09:15:26.648'),('pay_1759570758849_ipyshp67n','3d58c965-00f0-4919-bc4d-36d5314fe67f',100.00,'INR','DIGITAL_WALLET','COMPLETED','pay_RPLiqHgqMBz87V','Subscription payment for expert plan plan','{\"razorpay_order_id\": \"order_RPLiHdqbGPef4x\", \"razorpay_signature\": \"58d59903d17f93e971f7422137acf0df2676c8b7af56fb9dc2aa11fbc67906be\", \"razorpay_payment_id\": \"pay_RPLiqHgqMBz87V\"}','2025-10-04 09:39:18.744','2025-10-04 09:39:18.744','2025-10-04 09:39:18.744'),('pay_1759570843781_ashx33p40','3d58c965-00f0-4919-bc4d-36d5314fe67f',0.00,'INR','DIGITAL_WALLET','COMPLETED','free_plan_1759570843742','Subscription payment for Free plan','{\"razorpay_order_id\": \"free_order_1759570843742\", \"razorpay_signature\": \"free_signature_1759570843742\", \"razorpay_payment_id\": \"free_plan_1759570843742\"}','2025-10-04 09:40:43.747','2025-10-04 09:40:43.747','2025-10-04 09:40:43.747'),('pay_1759591018236_yjdabl0rr','2df9c72d-cc27-496f-9e97-44ab6f2d65cf',1302.39,'INR','DIGITAL_WALLET','COMPLETED','pay_RPRTYHrxFZyETk','Subscription payment for Premium plan (QUARTERLY)','{\"billingPeriod\": \"QUARTERLY\", \"razorpay_order_id\": \"order_RPRSwVbQKtoJwx\", \"razorpay_signature\": \"61f66f9011c5edd84bfc23c58fdc6ea3b742aec03a49cf5c086e3a482dce5a7d\", \"razorpay_payment_id\": \"pay_RPRTYHrxFZyETk\"}','2025-10-04 15:16:58.091','2025-10-04 15:16:58.091','2025-10-04 15:16:58.091'),('pay_1759594213049_7tj4otk5k','2df9c72d-cc27-496f-9e97-44ab6f2d65cf',499.00,'INR','DIGITAL_WALLET','COMPLETED','pay_RPSNoRSPuHmfCE','Subscription payment for Premium plan (MONTHLY)','{\"billingPeriod\": \"MONTHLY\", \"razorpay_order_id\": \"order_RPSNQzHKuXCAob\", \"razorpay_signature\": \"668cfc23dc4a8bf50f0568f2786627640b2bb0389b12aa91fecf207a2f1af353\", \"razorpay_payment_id\": \"pay_RPSNoRSPuHmfCE\"}','2025-10-04 16:10:12.988','2025-10-04 16:10:12.988','2025-10-04 16:10:12.988'),('pay_1759594338427_f4tfh1fnq','84079f20-ff49-4cef-a6f8-9a9bd52e6549',0.00,'INR','DIGITAL_WALLET','COMPLETED','free_plan_1759594338397','Subscription payment for Basic plan (MONTHLY)','{\"billingPeriod\": \"MONTHLY\", \"razorpay_order_id\": \"free_order_1759594338397\", \"razorpay_signature\": \"free_signature_1759594338397\", \"razorpay_payment_id\": \"free_plan_1759594338397\"}','2025-10-04 16:12:18.402','2025-10-04 16:12:18.402','2025-10-04 16:12:18.402'),('pay_1759594556422_zqbze93c1','84079f20-ff49-4cef-a6f8-9a9bd52e6549',2305.38,'INR','DIGITAL_WALLET','COMPLETED','pay_RPSTr8GHQ5wktw','Subscription payment for Premium plan (SEMIANNUAL)','{\"billingPeriod\": \"SEMIANNUAL\", \"razorpay_order_id\": \"order_RPSTS8ELSNkZDu\", \"razorpay_signature\": \"5a4ca230f23e797c45f7b5c07224af5c8144825b4e433f921205f051e8c0558e\", \"razorpay_payment_id\": \"pay_RPSTr8GHQ5wktw\"}','2025-10-04 16:15:56.389','2025-10-04 16:15:56.389','2025-10-04 16:15:56.389'),('pay_1759596789105_lze23tz3l','3d58c965-00f0-4919-bc4d-36d5314fe67f',0.00,'INR','DIGITAL_WALLET','COMPLETED','free_plan_1759596788989','Subscription payment for Basic plan (MONTHLY)','{\"billingPeriod\": \"MONTHLY\", \"razorpay_order_id\": \"free_order_1759596788989\", \"razorpay_signature\": \"free_signature_1759596788989\", \"razorpay_payment_id\": \"free_plan_1759596788989\"}','2025-10-04 16:53:08.998','2025-10-04 16:53:08.998','2025-10-04 16:53:08.998');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phoneverification`
--

DROP TABLE IF EXISTS `phoneverification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phoneverification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `usedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `PhoneVerification_expiresAt_idx` (`expiresAt`),
  KEY `PhoneVerification_isUsed_idx` (`isUsed`),
  KEY `PhoneVerification_otp_idx` (`otp`),
  KEY `PhoneVerification_phone_idx` (`phone`),
  KEY `PhoneVerification_userId_idx` (`userId`),
  CONSTRAINT `PhoneVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phoneverification`
--

LOCK TABLES `phoneverification` WRITE;
/*!40000 ALTER TABLE `phoneverification` DISABLE KEYS */;
/*!40000 ALTER TABLE `phoneverification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rating`
--

DROP TABLE IF EXISTS `rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rating` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expertProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collegeProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirementId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ratingRequestId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `overallRating` int NOT NULL,
  `review` text COLLATE utf8mb4_unicode_ci,
  `isAnonymous` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Rating_collegeProfileId_idx` (`collegeProfileId`),
  KEY `Rating_createdAt_idx` (`createdAt`),
  KEY `Rating_expertProfileId_idx` (`expertProfileId`),
  KEY `Rating_overallRating_idx` (`overallRating`),
  KEY `Rating_requirementId_idx` (`requirementId`),
  KEY `Rating_applicationId_idx` (`applicationId`),
  KEY `rating_ratingRequestId_fkey` (`ratingRequestId`),
  CONSTRAINT `rating_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rating_collegeProfileId_fkey` FOREIGN KEY (`collegeProfileId`) REFERENCES `collegeprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Rating_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `expertprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rating_ratingRequestId_fkey` FOREIGN KEY (`ratingRequestId`) REFERENCES `ratingrequest` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `rating_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirement` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rating`
--

LOCK TABLES `rating` WRITE;
/*!40000 ALTER TABLE `rating` DISABLE KEYS */;
INSERT INTO `rating` VALUES ('cmg7s4brq00030m1sbxvz5jof','ecd8e323-62e8-497d-9fe6-1b362435f12e','48159599-ced3-44e6-8706-e0e474bf4e31','cmg7j9t6s00030m5s1cpa319d','cmg7oywod00010mmkbosmzo3t','cmg7qg9z600010m1s4t2c5nai',3,'',0,'2025-10-01 09:23:41.840','2025-10-01 09:23:41.834');
/*!40000 ALTER TABLE `rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratingquestion`
--

DROP TABLE IF EXISTS `ratingquestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratingquestion` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ratingId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` int NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `RatingQuestion_ratingId_idx` (`ratingId`),
  KEY `RatingQuestion_category_idx` (`category`),
  CONSTRAINT `ratingquestion_ratingId_fkey` FOREIGN KEY (`ratingId`) REFERENCES `rating` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratingquestion`
--

LOCK TABLES `ratingquestion` WRITE;
/*!40000 ALTER TABLE `ratingquestion` DISABLE KEYS */;
INSERT INTO `ratingquestion` VALUES ('cmg7s4brr00040m1sftmyonuf','cmg7s4brq00030m1sbxvz5jof','Communication',4,'communication','2025-10-01 09:23:41.840','2025-10-01 09:23:41.835'),('cmg7s4brr00050m1s140phtlc','cmg7s4brq00030m1sbxvz5jof','Technical Expertise',4,'expertise','2025-10-01 09:23:41.840','2025-10-01 09:23:41.835'),('cmg7s4brr00060m1skgs7wf8s','cmg7s4brq00030m1sbxvz5jof','Timeliness',3,'timeliness','2025-10-01 09:23:41.840','2025-10-01 09:23:41.835'),('cmg7s4brr00070m1sxvtt2qzk','cmg7s4brq00030m1sbxvz5jof','Professionalism',4,'professionalism','2025-10-01 09:23:41.840','2025-10-01 09:23:41.835');
/*!40000 ALTER TABLE `ratingquestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratingrequest`
--

DROP TABLE IF EXISTS `ratingrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratingrequest` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expertProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collegeProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requirementId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicationId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `message` text COLLATE utf8mb4_unicode_ci,
  `requestedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `respondedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `RatingRequest_expertProfileId_idx` (`expertProfileId`),
  KEY `RatingRequest_collegeProfileId_idx` (`collegeProfileId`),
  KEY `RatingRequest_requirementId_idx` (`requirementId`),
  KEY `RatingRequest_status_idx` (`status`),
  KEY `ratingrequest_applicationId_fkey` (`applicationId`),
  CONSTRAINT `ratingrequest_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `application` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ratingrequest_collegeProfileId_fkey` FOREIGN KEY (`collegeProfileId`) REFERENCES `collegeprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ratingrequest_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `expertprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ratingrequest_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `requirement` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratingrequest`
--

LOCK TABLES `ratingrequest` WRITE;
/*!40000 ALTER TABLE `ratingrequest` DISABLE KEYS */;
INSERT INTO `ratingrequest` VALUES ('cmg7qg9z600010m1s4t2c5nai','ecd8e323-62e8-497d-9fe6-1b362435f12e','48159599-ced3-44e6-8706-e0e474bf4e31','cmg7j9t6s00030m5s1cpa319d','cmg7oywod00010mmkbosmzo3t','COMPLETED','scsxc','2025-10-01 08:37:00.151','2025-10-01 09:23:41.903','2025-10-01 08:37:00.151','2025-10-01 09:23:41.903'),('cmg7slnpe00030mu0e3k4sibd','ecd8e323-62e8-497d-9fe6-1b362435f12e','48159599-ced3-44e6-8706-e0e474bf4e31','cmg7mk3tc00030mwoxomtt3f1','cmg7p53wz00070mmkbzro2nts','APPROVED','jik','2025-10-01 09:37:10.466','2025-10-01 09:38:36.150','2025-10-01 09:37:10.466','2025-10-01 09:37:10.464');
/*!40000 ALTER TABLE `ratingrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refreshtoken`
--

DROP TABLE IF EXISTS `refreshtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refreshtoken` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `isRevoked` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RefreshToken_token_key` (`token`),
  KEY `RefreshToken_expiresAt_idx` (`expiresAt`),
  KEY `RefreshToken_isRevoked_idx` (`isRevoked`),
  KEY `RefreshToken_token_idx` (`token`),
  KEY `RefreshToken_userId_idx` (`userId`),
  CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refreshtoken`
--

LOCK TABLES `refreshtoken` WRITE;
/*!40000 ALTER TABLE `refreshtoken` DISABLE KEYS */;
INSERT INTO `refreshtoken` VALUES ('0111695d-e70f-4d26-911f-49fc58333810','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQyNjYyMywiZXhwIjoxNzYwMDMxNDIzfQ.cc-IdfVcTJ_nvA5M4DYOdB-yWFeS0i952mQP-7e2rJk','2025-10-09 17:37:03.471',1,'2025-10-02 17:37:03.473','2025-10-02 17:37:03.471'),('0315b245-d369-44db-8227-8dc1b536645d','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODM5OCwiZXhwIjoxNzYwMjAzMTk4fQ.XdUu8Qwd-TBRc-v9HL8h1R60IRxpN6rh5wudJzEyNoM','2025-10-11 17:19:58.329',1,'2025-10-04 17:19:58.331','2025-10-04 17:19:58.329'),('04e30122-1d80-44af-9159-14c9acc32cda','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU3NDM4OSwiZXhwIjoxNzYwMTc5MTg5fQ.nvYZ-YGt4j0tRJglWpD1370GG4_MrJBfuaWFZEsV1fY','2025-10-11 10:39:49.047',1,'2025-10-04 10:39:49.053','2025-10-04 10:39:49.047'),('06854071-9075-4bd6-817f-3022a8eef74b','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMzA1NiwiZXhwIjoxNzYwMjA3ODU2fQ.287d41rvamhspWL0aU4LzgGxp-aZw1bk5iOeznnO3DA','2025-10-11 18:37:36.396',0,'2025-10-04 18:37:36.399','2025-10-04 18:37:36.396'),('077e1506-38cb-4376-8616-b7df359c934f','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODU3NywiZXhwIjoxNzYwMjAzMzc3fQ.xqaQXnEC0wScP997i1nytjCG6RJyH03ZsJPiRLazAJo','2025-10-11 17:22:57.576',1,'2025-10-04 17:22:57.579','2025-10-04 17:22:57.576'),('116976ae-112e-4f54-8b61-7e61130c1e0f','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODQ3MCwiZXhwIjoxNzYwMjAzMjcwfQ.mmn5K04ZI4wysPOuELu3aEPNcvqtFCwrEek4uCblesc','2025-10-11 17:21:10.441',1,'2025-10-04 17:21:10.442','2025-10-04 17:21:10.441'),('11972b8e-7d4b-42ef-a2f6-e4df53fd4cb4','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwMjc5NiwiZXhwIjoxNzYxOTk0Nzk2fQ.P1s0uPj40S9u0aQT1CmoIujIKP4nfnbJO7Ia-v39LcI','2025-10-09 10:59:56.607',1,'2025-10-02 10:59:56.609','2025-10-02 10:59:56.607'),('150eb470-d49b-465a-a837-6d944b11468c','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU1OTMzMCwiZXhwIjoxNzYwMTY0MTMwfQ.xzdvQDTY0koESPqylzD39a5UBsRphcy0etCfAO0XYlo','2025-10-11 06:28:50.218',1,'2025-10-04 06:28:50.218','2025-10-04 06:28:50.218'),('157b1ed7-3764-46d3-a608-55de1bdc1150','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQyMzMzOCwiZXhwIjoxNzYwMDI4MTM4fQ.VUpf2Dktf8mw_vVVv4m1VgJ8JT1MtIMKxo08QUCF2Oc','2025-10-02 16:47:18.489',1,'2025-10-02 16:42:18.492','2025-10-02 16:42:18.490'),('15c13268-ef85-41e5-90e2-fa9d4577bb23','237162ea-f15e-47d9-91e0-baf6ccc026cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzcxNjJlYS1mMTVlLTQ3ZDktOTFlMC1iYWY2Y2NjMDI2Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODk5NDM0NSwiZXhwIjoxNzYxNTg2MzQ1fQ.8iwve6g-wWajnm1E8y4hmJ6eAglK8D8jSXzWwe7H4_Q','2025-10-04 17:32:25.600',1,'2025-09-27 17:32:25.602','2025-09-27 17:32:25.600'),('16b0569b-c533-4665-837f-47b49890a4a3','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMxMDA0MSwiZXhwIjoxNzYxOTAyMDQxfQ.tXESaGDeuF-_YX5nWrYKRCzb_Qym7kwAw9y4iPgNeRY','2025-10-08 09:14:01.896',1,'2025-10-01 09:14:01.899','2025-10-01 09:14:01.897'),('17deeec6-fa16-4723-b034-8d8d52932711','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODU2MjI2MCwiZXhwIjoxNzYxMTU0MjYwfQ.wzuUXZxVvtmJ6VbYQBZ5IBZJve1KNLTzCjRtinaF1XU','2025-09-29 17:31:00.742',1,'2025-09-22 17:31:00.743','2025-09-22 17:31:00.742'),('19789461-9f73-4e18-b7e6-bad7572a1a24','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMzNzQxNCwiZXhwIjoxNzYxOTI5NDE0fQ.GZCJZMsYPVnV0Q3g6zh98I2VXjCKivbedjqO_MP26gk','2025-10-08 16:50:14.200',1,'2025-10-01 16:50:14.202','2025-10-01 16:50:14.200'),('1afaba51-e926-440b-b84c-00a5807f279b','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMyOTYzNywiZXhwIjoxNzYxOTIxNjM3fQ.N3-joDK359Qhp6Um73VmNlXITnxtNeSZ-9aBo1OLukk','2025-10-08 14:40:37.290',1,'2025-10-01 14:40:37.292','2025-10-01 14:40:37.290'),('1ca93ba6-9388-4630-9518-4af044019d50','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMDcyMywiZXhwIjoxNzYwMjA1NTIzfQ.8WTx253VJgW_iTRf-rpv5UnOUzi_Ew8_E2W94yjq-VU','2025-10-11 17:58:43.834',0,'2025-10-04 17:58:43.836','2025-10-04 17:58:43.834'),('20ecd747-4100-41df-a4ad-04d8957013f0','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMzUxOCwiZXhwIjoxNzYwMjA4MzE4fQ.CzTKorfTaZVq1RVV5D38Y64VhLg111pXggZS3OJf7Gc','2025-10-11 18:45:18.972',1,'2025-10-04 18:45:18.974','2025-10-04 18:45:18.972'),('2129fa97-4a56-444e-86ee-bab457e2e981','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNTI3NSwiZXhwIjoxNzYxOTk3Mjc1fQ.oXOjclF8mZvOzntqsSZ-qWFHFP2amVh3mdcJAeAPTMg','2025-10-02 11:46:15.950',1,'2025-10-02 11:41:15.952','2025-10-02 11:41:15.950'),('21647b1d-ccc2-477d-953f-3a64862b83e6','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODUzOCwiZXhwIjoxNzYwMjAzMzM4fQ.K9Ku4k8YGcPzyhtDuj0c5H422utIkHdUZ72GI488kpo','2025-10-11 17:22:18.686',1,'2025-10-04 17:22:18.688','2025-10-04 17:22:18.686'),('2812f7f9-d4d4-4302-b270-216597bcf238','54f3a261-9dd1-4a70-ad85-78f9395af57e','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NGYzYTI2MS05ZGQxLTRhNzAtYWQ4NS03OGY5Mzk1YWY1N2UiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODk5MzkyMywiZXhwIjoxNzYxNTg1OTIzfQ.k3U8wMeHjF99761e15hXMD8sTgpJdnVc_S9ixdKxBOU','2025-10-04 17:25:23.229',1,'2025-09-27 17:25:23.232','2025-09-27 17:25:23.230'),('2b7638c2-55d7-4f7e-af99-ac1f4cb48e84','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYzOTc2MiwiZXhwIjoxNzYwMjQ0NTYyfQ.f3a-UeqLRTQZoVLbFEhgN7pvgGHHiIiZrXkuZHilB9A','2025-10-12 04:49:22.697',1,'2025-10-05 04:49:22.699','2025-10-05 04:49:22.697'),('2f0b355b-e205-444c-8bda-b4bfa78e63c9','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY1MDczNSwiZXhwIjoxNzYwMjU1NTM1fQ.DAkpxGP-R8m8wayJTowPfBYkJQ22fJrlcNNKEfjRFHI','2025-10-12 07:52:15.348',0,'2025-10-05 07:52:15.351','2025-10-05 07:52:15.348'),('2f463452-572f-4511-9a34-811b4600a56c','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU2NjIwNywiZXhwIjoxNzYwMTcxMDA3fQ.jbLNw_BgvFW1A6F_mJ-6zSECZEHjzQninFs590uVmmQ','2025-10-11 08:23:27.562',1,'2025-10-04 08:23:27.563','2025-10-04 08:23:27.562'),('2fa31970-3e89-4b39-8bb4-e76572750631','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwMDQ5MCwiZXhwIjoxNzYxOTkyNDkwfQ.iEnNRbOcaorrkiO_moX5Rz5KHnxtO6f0HD0YHpkUKpQ','2025-10-09 10:21:30.283',1,'2025-10-02 10:21:30.285','2025-10-02 10:21:30.284'),('305961a7-4af2-4731-8796-13658120c18c','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMwMjg5OCwiZXhwIjoxNzYxODk0ODk4fQ.yOhVs5UcxMo-NtUGgw9_nCRpSqAjyUPEj7Bph4EJTEw','2025-10-08 07:14:58.001',1,'2025-10-01 07:14:58.002','2025-10-01 07:14:58.001'),('314506d5-14fa-4f56-bd15-8df2338f2721','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5OTcyOSwiZXhwIjoxNzYwMjA0NTI5fQ.ntFy8775UXljeduR_7r_BZRTvMoupVWgPMSUhefWCes','2025-10-11 17:42:09.909',0,'2025-10-04 17:42:09.914','2025-10-04 17:42:09.910'),('32e85a2d-3481-4986-be33-69d722b84a33','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA0ODUwOCwiZXhwIjoxNzYxNjQwNTA4fQ.Bw7QzlkAOhst9s2W51DRMn66INvz8yLJYZdLRAoqfJM','2025-10-05 08:35:08.162',1,'2025-09-28 08:35:08.165','2025-09-28 08:35:08.162'),('3594f12b-abc1-42b3-b39d-d0064e3c4af2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjIxOSwiZXhwIjoxNzU5NDA2NTE5fQ.h1xr6f48pm5qnZyTUtx3nR-Ofqvn_jjVDnfobkOiqUY','2025-10-02 12:01:59.134',1,'2025-10-02 11:56:59.136','2025-10-02 11:56:59.134'),('35d6e9e2-7f67-4a7f-b99c-c7f946d182be','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODU2MjUwOCwiZXhwIjoxNzYxMTU0NTA4fQ.aTyVetzJVCvQXuriX2tVSQm5TCTxRIYvOIKQVqiTmQ4','2025-09-29 17:35:08.974',1,'2025-09-22 17:35:08.975','2025-09-22 17:35:08.974'),('37df422b-a1bc-4d6d-9e15-23476af14786','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNDE2MywiZXhwIjoxNzYxOTk2MTYzfQ.PHXb3mPQiWAL8mVG4CP41Z-tKxVao09pBoo5FAG7Nes','2025-10-09 11:22:43.394',1,'2025-10-02 11:22:43.395','2025-10-02 11:22:43.394'),('3985cbd5-4c95-4365-ac62-aabce54cb447','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODY0MzMwNCwiZXhwIjoxNzYxMjM1MzA0fQ.zAa-f3SgvoympVj6wC61051YZkc4NSws3TbU_CCrRmM','2025-09-30 16:01:44.539',1,'2025-09-23 16:01:44.541','2025-09-23 16:01:44.539'),('41cb7dc3-4485-44e9-961b-4cbc5846b682','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY1MDA2MSwiZXhwIjoxNzYwMjU0ODYxfQ.gU0Veua5XKMt0g0vc8t3NVsQxJo1Jl_cZC84XfSRh_Y','2025-10-12 07:41:01.937',0,'2025-10-05 07:41:01.939','2025-10-05 07:41:01.937'),('425672eb-98b1-4c3b-9a6a-d6f8d3e6b097','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU3NDM4OSwiZXhwIjoxNzYwMTc5MTg5fQ.mqKErOvT2WZNcrNoXKfT33-tsEIKOCvp6LI3PeTxzng','2025-10-11 10:39:49.071',1,'2025-10-04 10:39:49.073','2025-10-04 10:39:49.071'),('428b286c-c2cd-4bca-a21f-795f41c82857','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMzI5NSwiZXhwIjoxNzYwMjA4MDk1fQ.YNs0aVlZZsHjRj_nKmewl0VRFHCt17NjwLT3WvdZwDo','2025-10-11 18:41:35.609',0,'2025-10-04 18:41:35.610','2025-10-04 18:41:35.609'),('447a81b4-a260-4c96-add2-33a49723a04e','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNTA4NSwiZXhwIjoxNzYxOTk3MDg1fQ.v2zak6E0wqMMPVY9clvF2dhxloc6fiIx8L9_f9RFi1k','2025-10-02 11:43:05.204',1,'2025-10-02 11:38:05.206','2025-10-02 11:38:05.204'),('480557c9-30c0-40bd-8784-14cd61e9700f','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYzNjA0MywiZXhwIjoxNzYwMjQwODQzfQ.oYBghfYBL6_IXRYIrrJkH6SkgiVesgffbb4Sv1Nne_w','2025-10-12 03:47:23.319',1,'2025-10-05 03:47:23.321','2025-10-05 03:47:23.319'),('4b5b617c-4aa3-4a6a-97ee-a2efc4730517','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYzOTQ2MSwiZXhwIjoxNzYwMjQ0MjYxfQ.ntTpMKuLXWVaIrT7cJaxF9DgAo39qjRa_ntXDYQby8I','2025-10-12 04:44:21.310',0,'2025-10-05 04:44:21.313','2025-10-05 04:44:21.310'),('4b7ae55e-7849-4ff3-98c9-b8db692db24a','7566d1f0-4c85-4357-bede-738182673d47','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTY2ZDFmMC00Yzg1LTQzNTctYmVkZS03MzgxODI2NzNkNDciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTAzODY2MSwiZXhwIjoxNzYxNjMwNjYxfQ.yRzYUu7VW2bKJy44-cv6IKbq91m2-hKrn2yMDauWSHY','2025-10-05 05:51:01.905',1,'2025-09-28 05:51:01.907','2025-09-28 05:51:01.905'),('4d61267f-d0af-4cb8-984c-7a6b84887817','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU4MTcwNSwiZXhwIjoxNzYwMTg2NTA1fQ.qbYgwlMZeXnjZartAn_bw5P6HbDem5_zvonva4rCrmE','2025-10-11 12:41:45.024',1,'2025-10-04 12:41:45.032','2025-10-04 12:41:45.024'),('4de5ae3e-e37b-424e-83f6-b78c0d37b721','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMzMDY3NiwiZXhwIjoxNzYxOTIyNjc2fQ.twjEWHgduekYIzbT0s3xGFVtwTMGu-OTDIYxKDs4-6U','2025-10-08 14:57:56.124',1,'2025-10-01 14:57:56.127','2025-10-01 14:57:56.124'),('4ebbe9de-eeaf-42ac-a906-5e410f45f237','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU2NjE3MiwiZXhwIjoxNzYwMTcwOTcyfQ.VigN8rqOuHGyK8hgIFmYTUKKqNkCEuYh6wEsFyOpr4I','2025-10-11 08:22:52.170',1,'2025-10-04 08:22:52.172','2025-10-04 08:22:52.170'),('5313593c-0732-4167-b9c7-5ca54c111229','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA0MDIyMCwiZXhwIjoxNzYxNjMyMjIwfQ.PX7kA9uHYGaUauueqwwnYWWkzGZRVgqXMskN0amkbuU','2025-10-05 06:17:00.464',1,'2025-09-28 06:17:00.462','2025-09-28 06:17:00.464'),('587bdeba-87a6-4160-a381-03655edb4993','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwOTIwOCwiZXhwIjoxNzU5NDA5NTA4fQ.0n7_RNlQTX5XrhV8KJVRoUgxBQmf6NJ5SHUbEKAjWU0','2025-10-02 12:51:48.612',1,'2025-10-02 12:46:48.615','2025-10-02 12:46:48.613'),('592ec1ee-c541-4fdf-b710-0540f16b76f0','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODY0NDExNiwiZXhwIjoxNzYxMjM2MTE2fQ.iUdxFFHZ28--DL3mQV6oz-U9lbNgDodyjyWhpVg-z2s','2025-09-30 16:15:16.151',1,'2025-09-23 16:15:16.153','2025-09-23 16:15:16.151'),('5e920191-58da-4dce-8381-06a1a14e1446','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU2Njc3NiwiZXhwIjoxNzYwMTcxNTc2fQ.jgh5kzPYbjids6kslsrzlgZmWoWO4eIhoSEODbph9GY','2025-10-11 08:32:56.710',1,'2025-10-04 08:32:56.712','2025-10-04 08:32:56.710'),('5fe22edd-22d7-402f-8127-22e6104729b5','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU1NzU5NiwiZXhwIjoxNzYwMTYyMzk2fQ.bMewj2_96AvMwVXDcQJ5uIKIwYHJosfcXPHskRdpcZc','2025-10-11 05:59:56.551',1,'2025-10-04 05:59:56.552','2025-10-04 05:59:56.551'),('61951f5c-d851-41f9-9592-1d6dec97d872','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQxMTQ2NCwiZXhwIjoxNzYwMDE2MjY0fQ.659RLZzPgn-JvIgXhnDHafc8TjrNPP1wWARI0nAbV3g','2025-10-02 13:29:24.907',1,'2025-10-02 13:24:24.908','2025-10-02 13:24:24.907'),('62abacfb-7ff6-4f33-abf6-645465b45947','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5NTUzMSwiZXhwIjoxNzYwMjAwMzMxfQ.Z5OuWJe4CfA-dfwj1eVSPuAgLq7TxHNRJXggOR0l8C0','2025-10-11 16:32:11.827',1,'2025-10-04 16:32:11.829','2025-10-04 16:32:11.827'),('64877900-05bd-493c-bd85-5c903736fb4d','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMTQ0OCwiZXhwIjoxNzYwMjA2MjQ4fQ.iA3OVNeNXAbAs-nmO-Fl8JG0dExE9wHbw8Zsx_rBM9A','2025-10-11 18:10:48.648',0,'2025-10-04 18:10:48.650','2025-10-04 18:10:48.648'),('667376ba-54e2-4232-9964-bb8db583c622','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODg3OSwiZXhwIjoxNzYwMjAzNjc5fQ.ppqFhqfNxww5vTwdwcKgJDwy8cOML2Qa-qNd-SIfzp0','2025-10-11 17:27:59.480',0,'2025-10-04 17:27:59.482','2025-10-04 17:27:59.480'),('67c64fa7-7d25-4ea4-b358-1c23bb875068','4615a45b-9ac6-4259-a660-8f6a9209970d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjE1YTQ1Yi05YWM2LTQyNTktYTY2MC04ZjZhOTIwOTk3MGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTAzOTMzNiwiZXhwIjoxNzYxNjMxMzM2fQ.DUT6fQrleYg3JjZnNfMfIA8b6mm36s58ny2l6qtSm1Q','2025-10-05 06:02:16.582',1,'2025-09-28 06:02:16.580','2025-09-28 06:02:16.582'),('67d5ad93-ab77-4be7-a0b7-bf13523ded6b','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU1NzY1OSwiZXhwIjoxNzYwMTYyNDU5fQ.VRmaU8_v7DO9Qkv0azIIKBDX9j6ldrDzR6O51xgwIX4','2025-10-11 06:00:59.158',1,'2025-10-04 06:00:59.160','2025-10-04 06:00:59.158'),('6b923574-26a4-462d-9bde-e2f7d0b1c6b8','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU1OTU3NSwiZXhwIjoxNzYwMTY0Mzc1fQ.ZpIqFZLta-uoQTQ521x8mI3SbT5S4JRo6YD0TNIeOg8','2025-10-11 06:32:55.196',1,'2025-10-04 06:32:55.195','2025-10-04 06:32:55.196'),('6fb9c943-deaf-41e4-9b09-8436a47afe3e','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjIxNSwiZXhwIjoxNzU5NDA2NTE1fQ.UHUAlrbI1wKDeSyJOd8a-yVG-vBzEhkvaS9nxwE5HzY','2025-10-02 12:01:55.932',1,'2025-10-02 11:56:55.934','2025-10-02 11:56:55.932'),('704be2f7-eb52-4b30-90d1-1c0176b32285','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5OTc2NywiZXhwIjoxNzYwMjA0NTY3fQ.hXEeAOwEhxKm-6_Jk_Z06z9tWk99_aMTJCDrjpUewF0','2025-10-11 17:42:47.898',1,'2025-10-04 17:42:47.900','2025-10-04 17:42:47.898'),('7105ac93-60f5-444e-9177-2d4700732e94','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODQ1MCwiZXhwIjoxNzYwMjAzMjUwfQ.ncwUkUsyRBrT3gV99czkXBmaFmmMUwRvz-eFPPimsk4','2025-10-11 17:20:50.150',1,'2025-10-04 17:20:50.152','2025-10-04 17:20:50.150'),('71d89fbd-4150-493b-ade3-0265ee49bc85','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjIwNiwiZXhwIjoxNzU5NDA2NTA2fQ.YygiOBNxWCGZnfKV8duipTerne6_oKel3RRaOZLj-dI','2025-10-02 12:01:46.082',1,'2025-10-02 11:56:46.084','2025-10-02 11:56:46.082'),('75e3e40a-4be6-408a-b591-3e6eb150a8ab','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMzMDE2MSwiZXhwIjoxNzYxOTIyMTYxfQ.ue2Fp6i4taDm4IlPid_zhQuERTyE-p-_OZIDCWyXPpA','2025-10-08 14:49:21.945',1,'2025-10-01 14:49:21.948','2025-10-01 14:49:21.945'),('778f5259-0d64-4a59-8fcb-596991c93229','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODY0MzM1MywiZXhwIjoxNzYxMjM1MzUzfQ.tl5gj6dxHG-NU3GTiS0aPfuEWGrjV0WNETaaeOpS4bg','2025-09-30 16:02:33.088',1,'2025-09-23 16:02:33.090','2025-09-23 16:02:33.088'),('77a9db78-5f5d-4739-bd5c-aacb28fd77ff','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTI5NTYwNSwiZXhwIjoxNzYxODg3NjA1fQ.Bq_hGYrC22GXSq13TXNVfQgV48iA6IdYq16bu7kTga8','2025-10-08 05:13:25.004',1,'2025-10-01 05:13:25.006','2025-10-01 05:13:25.004'),('7e1c3ce6-9c3f-46de-9a6c-d7fe4f96adb9','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5NjI2MCwiZXhwIjoxNzYwMjAxMDYwfQ.pY0UHy5T3CJZCPLMpSz9SgxNmspTTAZXTwR4sZgE4EU','2025-10-11 16:44:20.909',1,'2025-10-04 16:44:20.912','2025-10-04 16:44:20.909'),('7e640c98-ca45-488a-872a-332cbbf24ca1','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMwMjg5MiwiZXhwIjoxNzYxODk0ODkyfQ.R10tyYPoqaTmK2mo30OY185cDEmzk5NR0vz8sw2C90w','2025-10-08 07:14:52.022',1,'2025-10-01 07:14:52.024','2025-10-01 07:14:52.022'),('7f564140-50c6-436f-93fe-e3eaa28b0d43','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY2MjA5MCwiZXhwIjoxNzYwMjY2ODkwfQ.hxj33evFUvih0XdB23ysgHuaDueihodyqsoUNhU_vTs','2025-10-12 11:01:30.184',0,'2025-10-05 11:01:30.186','2025-10-05 11:01:30.184'),('80db8da1-f602-4223-95de-4eb38eb5a95e','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY0MzUyNiwiZXhwIjoxNzYwMjQ4MzI2fQ.pTTT7F6o0PsoTytyI33VhHmkd7U9ZWQ6g5pn9mYUFtM','2025-10-12 05:52:06.918',1,'2025-10-05 05:52:06.920','2025-10-05 05:52:06.918'),('81ee3c8e-5f55-46f4-a978-88ff5f7b72e8','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU4NzQxMCwiZXhwIjoxNzYwMTkyMjEwfQ.dPAn-SkwMI7rQ6x5ZgTNGNhOwcLbixe_AfEFIAWJYiQ','2025-10-11 14:16:50.327',1,'2025-10-04 14:16:50.329','2025-10-04 14:16:50.327'),('89f7f32b-d1af-487a-9b7d-afdcc20ddfe1','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNTA3MCwiZXhwIjoxNzYxOTk3MDcwfQ.Qku5Fvixf9LhmA0SsrzcpcAj3HX1MbqBAFf0THqiQrc','2025-10-02 11:42:50.829',1,'2025-10-02 11:37:50.833','2025-10-02 11:37:50.829'),('8a4b61d6-0c2a-4189-b4b9-0a8788ffaf43','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU4MTcwNSwiZXhwIjoxNzYwMTg2NTA1fQ.YHH-4BqxAT1-nF4smYNmxtn83VgmjLoso-XlPh_rES4','2025-10-11 12:41:45.048',1,'2025-10-04 12:41:45.051','2025-10-04 12:41:45.048'),('8b03d6d5-4765-47ae-a412-fe1900fb16b2','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQyMzUwNiwiZXhwIjoxNzYwMDI4MzA2fQ.A9LN_m3Wd5OE2BkqA_RyDa3MfkSY462PBRsauzsPtPg','2025-10-02 16:50:06.085',1,'2025-10-02 16:45:06.087','2025-10-02 16:45:06.085'),('8be5f22c-bf83-417f-b019-a26e836164e2','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA1OTYwMSwiZXhwIjoxNzYxNjUxNjAxfQ.780LVxpi1kDYbxBnIPIPZc5cucCKDNKXIcfddumi4sg','2025-10-05 11:40:01.253',1,'2025-09-28 11:40:01.256','2025-09-28 11:40:01.253'),('8dce9458-6a23-4ac5-acd2-c4cee33001c0','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODIyNCwiZXhwIjoxNzYwMjAzMDI0fQ.WGahXjSn3W8kz03MPCu39-mvadux826YCy8MRnYQQ6I','2025-10-11 17:17:04.409',1,'2025-10-04 17:17:04.412','2025-10-04 17:17:04.409'),('90d5eddc-b6d8-444f-a261-8fb607e64900','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY2NDU1MiwiZXhwIjoxNzYwMjY5MzUyfQ.TOhu6cGga8lksyLtSCjoYJR0LqtIF6p2IRtmgdbDP1Q','2025-10-12 11:42:32.175',0,'2025-10-05 11:42:32.177','2025-10-05 11:42:32.175'),('9474f485-8501-497a-bac9-0cbd43959a0a','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA4MDA1NSwiZXhwIjoxNzYxNjcyMDU1fQ.x9Z1cTjQbtXQKmyUj0F4blI4hHysWMBxZIqSLFYanRo','2025-10-05 17:20:55.748',1,'2025-09-28 17:20:55.754','2025-09-28 17:20:55.748'),('9577acbb-e6ef-4f08-9b32-e49f00311c1d','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY1NDI1NiwiZXhwIjoxNzYwMjU5MDU2fQ.CxysQfXh0R5C-Fr0E_IJqr6p7k0XlHHZlM3Jp-XoY1E','2025-10-12 08:50:56.167',0,'2025-10-05 08:50:56.170','2025-10-05 08:50:56.167'),('9655c07f-7d83-4393-b7c6-bd24239c635f','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA0MDI3NSwiZXhwIjoxNzYxNjMyMjc1fQ.Y1xqmpubz4meY44F6vyGpGKBST-40zQQFVEz6_PVtK4','2025-10-05 06:17:55.790',1,'2025-09-28 06:17:55.791','2025-09-28 06:17:55.790'),('96d776e5-1a14-444c-a171-fd575f28895e','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNzg5NiwiZXhwIjoxNzU5NDA4MTk2fQ.istBInXl-j1b4L-s2gPklC-q4w0UmLSgA8GoYR5doqY','2025-10-02 12:29:56.888',1,'2025-10-02 12:24:56.889','2025-10-02 12:24:56.888'),('97e2ed94-9568-4f8d-a0e8-89d2df723d2c','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODgzNCwiZXhwIjoxNzYwMjAzNjM0fQ.jJcIvXNThOntp7ldAFQce9j1_jGIRjETEPdx9V6oo1I','2025-10-11 17:27:14.861',0,'2025-10-04 17:27:14.863','2025-10-04 17:27:14.861'),('9c2b0858-88fa-4fbe-9eff-062365c61570','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwNDA3OSwiZXhwIjoxNzYwMjA4ODc5fQ.95z9FKSt6f9G107ahd2wv0kdN-AgMommAbMY85R4anY','2025-10-11 18:54:39.801',0,'2025-10-04 18:54:39.803','2025-10-04 18:54:39.801'),('9c5ff685-3e3e-466a-a3cd-dc48f8ce485b','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA0NzU5MCwiZXhwIjoxNzYxNjM5NTkwfQ.PCdgKzT1C1uOH8IyEV5gj6GPxeEELOgdV4b9ukH8Niw','2025-10-05 08:19:50.421',1,'2025-09-28 08:19:50.423','2025-09-28 08:19:50.421'),('9d8e8a87-7386-4647-a6c4-6ad85b94ac9d','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5ODg2MCwiZXhwIjoxNzYwMjAzNjYwfQ.AUFiQELquPekNb4VYYpWAYpriPNn1v_LTItioss3s0Y','2025-10-11 17:27:40.212',1,'2025-10-04 17:27:40.213','2025-10-04 17:27:40.212'),('a20eb2dd-13b7-45fe-adcd-edc0a1e400e0','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU4ODk1NCwiZXhwIjoxNzYwMTkzNzU0fQ.9jvYd0_vLTc_TniDgvz4mW2nHYKYUq3lvb2IsDm9v3I','2025-10-11 14:42:34.385',1,'2025-10-04 14:42:34.386','2025-10-04 14:42:34.385'),('a2adccf4-a04d-41b5-8256-2ca4d76224d7','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQyOTk2MywiZXhwIjoxNzYwMDM0NzYzfQ.28pi_jzeTxurL2ebcXfIcdS5sQka6VB092RNMvmPit4','2025-10-09 18:32:43.858',1,'2025-10-02 18:32:43.863','2025-10-02 18:32:43.859'),('a4f99b6d-8217-4574-a6af-acd71cfcd215','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwODU2OSwiZXhwIjoxNzU5NDA4ODY5fQ.pNxEAHmCJlOPPMzdR2ikh4n1CApjhLVr60PLE8QxYpM','2025-10-02 12:41:09.532',1,'2025-10-02 12:36:09.534','2025-10-02 12:36:09.532'),('a6a5dca9-7cf5-43dd-a181-e0e80f5d6175','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU4MTcwNSwiZXhwIjoxNzYwMTg2NTA1fQ.bI2J7azkdsRtA-1_iMcrnlDVSRpul3yOOlSGVMeds_o','2025-10-11 12:41:45.919',1,'2025-10-04 12:41:45.921','2025-10-04 12:41:45.919'),('ac0a306e-6e4f-4f63-b850-d731a1054dd9','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU4ODkzNywiZXhwIjoxNzYwMTkzNzM3fQ.qXL8ED39Alr5NgcLwrWGzAHu16XmXU8Rmgs3S13dHxA','2025-10-11 14:42:17.761',1,'2025-10-04 14:42:17.764','2025-10-04 14:42:17.761'),('ac9d40c2-9336-4203-a243-8a8a3d69e446','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMyOTY3MCwiZXhwIjoxNzYxOTIxNjcwfQ.of5DUPKJ4ZmJ07LwpYyEAtBxNOPVoantGsGh_K4ymic','2025-10-08 14:41:10.823',1,'2025-10-01 14:41:10.825','2025-10-01 14:41:10.823'),('adae349a-9f62-4e45-94dd-a6396a255ddf','7566d1f0-4c85-4357-bede-738182673d47','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTY2ZDFmMC00Yzg1LTQzNTctYmVkZS03MzgxODI2NzNkNDciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTAzOTAzNywiZXhwIjoxNzYxNjMxMDM3fQ.CIMrAPlaWf80w6IYVozLYHedE5YZPivdVm_WFSMpH0k','2025-10-05 05:57:17.761',1,'2025-09-28 05:57:17.757','2025-09-28 05:57:17.761'),('b12fa0ac-e556-4b8a-83c5-93bfaefc6232','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjMwMCwiZXhwIjoxNzU5NDA2NjAwfQ.2nQUZM72APa4exZlZ4Gh22fizIsCEugcOEd7MXRNnnM','2025-10-02 12:03:20.002',1,'2025-10-02 11:58:20.003','2025-10-02 11:58:20.002'),('b1570c81-1131-4282-aa5d-3e8c2ab4f6c8','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY2MDU3MywiZXhwIjoxNzYwMjY1MzczfQ.WhmVdaDFwh6KYeX8OOlt2al7m9KydM2mNSn9ypkqHG8','2025-10-12 10:36:13.215',0,'2025-10-05 10:36:13.219','2025-10-05 10:36:13.215'),('b445f8ab-e1b9-444c-805b-749a0821c21e','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY2NzY5NSwiZXhwIjoxNzYwMjcyNDk1fQ.cEZvCydQNgmR7hT_WLQ5BP_YALWlIdppQXEDDuynemM','2025-10-12 12:34:55.544',0,'2025-10-05 12:34:55.546','2025-10-05 12:34:55.544'),('b6f0bb5b-0719-478d-9701-0f35e89b93e2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODU2NjMzMywiZXhwIjoxNzYxMTU4MzMzfQ.j8FVk1MtNZXP3UKCCRjiD0lc5U6TrCOsi0c0MYKMmBk','2025-09-29 18:38:53.550',1,'2025-09-22 18:38:53.553','2025-09-22 18:38:53.550'),('b85e2d9a-8b5e-40f1-a09b-bd0de1e6bc12','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY1NzIzNiwiZXhwIjoxNzYwMjYyMDM2fQ.3BUe43yMvyuApCmNqQ6S0svUgg5RR3WqdxAKqRBITC4','2025-10-12 09:40:36.970',0,'2025-10-05 09:40:36.973','2025-10-05 09:40:36.971'),('bd7377e8-c963-4ebe-abe3-54822b70c506','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU3NDM4OSwiZXhwIjoxNzYwMTc5MTg5fQ.sXbTnfnF8uninPIUafhySatyM_VoKhM7nLBS2wFhoKo','2025-10-11 10:39:49.361',1,'2025-10-04 10:39:49.362','2025-10-04 10:39:49.361'),('bdf630ca-8aee-48fc-a0a7-9ad089f8b1be','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwOTAxNSwiZXhwIjoxNzU5NDA5MzE1fQ.RRC648jTwxQ4uX61V2L7QWBKTTogMkYKM6Aay3vrRB0','2025-10-02 12:48:35.820',1,'2025-10-02 12:43:35.821','2025-10-02 12:43:35.820'),('c0a65338-7d02-4aea-af7e-62772c9d61fa','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMyMzU1NywiZXhwIjoxNzYxOTE1NTU3fQ.0AVUChNXYP6Sc3b32tlloY8MBZ3loozojr6M42HSfgM','2025-10-08 12:59:17.658',1,'2025-10-01 12:59:17.660','2025-10-01 12:59:17.658'),('c1e74cc9-4af6-4ef5-8472-8d5e977c368e','4615a45b-9ac6-4259-a660-8f6a9209970d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjE1YTQ1Yi05YWM2LTQyNTktYTY2MC04ZjZhOTIwOTk3MGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTAzOTc1MSwiZXhwIjoxNzYxNjMxNzUxfQ.MoglQd09ldEDKi4ufBpfrul4qsZoHyGXp0xa01NPBYE','2025-10-05 06:09:11.293',1,'2025-09-28 06:09:11.291','2025-09-28 06:09:11.293'),('c7236ff8-db0d-4fe3-8ad4-6431d856caeb','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTM5MzI4NSwiZXhwIjoxNzYxOTg1Mjg1fQ.b9PWS8tHVEc5JlpsWrwHRzg7tWXylq0dXpnR73XzwbQ','2025-10-09 08:21:25.818',1,'2025-10-02 08:21:25.821','2025-10-02 08:21:25.818'),('c7b8b2f6-e9ea-4435-8597-3e77ea4735d6','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA2MzYxOCwiZXhwIjoxNzYxNjU1NjE4fQ.m_jCiTzQ23OO9EQsLVvmjrOnIzg7GalzJQTBCN-Zntk','2025-10-05 12:46:58.481',1,'2025-09-28 12:46:58.484','2025-09-28 12:46:58.481'),('c8f354ab-140c-4ef4-8214-c28973bd5c4a','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5Mzc0NSwiZXhwIjoxNzYwMTk4NTQ1fQ.q5Z09C7roFee4rT4wrq7Ydylv-bRwC2UlFEkghpscYM','2025-10-11 16:02:25.818',1,'2025-10-04 16:02:25.821','2025-10-04 16:02:25.819'),('c9686660-2d8a-4f1e-81da-6879d04c5e1b','4615a45b-9ac6-4259-a660-8f6a9209970d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjE1YTQ1Yi05YWM2LTQyNTktYTY2MC04ZjZhOTIwOTk3MGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTAzOTY3MSwiZXhwIjoxNzYxNjMxNjcxfQ.iEtxh5ad0nsB9G4ITK3Es-h7C88jLZSjlhAzS_K_myQ','2025-10-05 06:07:51.305',1,'2025-09-28 06:07:51.307','2025-09-28 06:07:51.305'),('cd21fc3a-d191-4a3b-a1cf-f486581458e7','0981e10a-c1f1-4988-8459-3fbefc0a591f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTgxZTEwYS1jMWYxLTQ5ODgtODQ1OS0zZmJlZmMwYTU5MWYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODk5NDQyMiwiZXhwIjoxNzYxNTg2NDIyfQ.SSsjvNAckQlukPdKv5pWF2Bhsum1Rvi12GN-q7WK9CE','2025-10-04 17:33:42.372',1,'2025-09-27 17:33:42.374','2025-09-27 17:33:42.372'),('ce23df4a-8770-43a8-9dc7-40a0b1eb312a','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA1OTA5NiwiZXhwIjoxNzYxNjUxMDk2fQ._NCJZwX3jISp0bWLNUsqvLjwIM3VPjSGKZuF659DUhE','2025-10-05 11:31:36.459',1,'2025-09-28 11:31:36.461','2025-09-28 11:31:36.459'),('d09a4294-3461-4c46-bd2c-3f541c734bb2','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYzNTk5NywiZXhwIjoxNzYwMjQwNzk3fQ.3JQUgAC8MbSYVajyerzMRiBv-0yupUxkFvZjqwnKyiw','2025-10-12 03:46:37.776',1,'2025-10-05 03:46:37.778','2025-10-05 03:46:37.776'),('d1ba243c-82e8-4055-bb71-9be729cf90d2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwOTczMywiZXhwIjoxNzYwMDE0NTMzfQ.OrqfLXWWU6fCmPLmNea-zIAl1NWFQew6L5yDAi-XWHg','2025-10-02 13:00:33.735',1,'2025-10-02 12:55:33.737','2025-10-02 12:55:33.735'),('d46874c7-1edd-4ec2-acfc-90670a44fcb1','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMDcwOCwiZXhwIjoxNzYwMjA1NTA4fQ.cdp1Y4VE7pN7YPZFOX-dOmBmxIqREIN9CsdXsDXeZP8','2025-10-11 17:58:28.691',1,'2025-10-04 17:58:28.696','2025-10-04 17:58:28.691'),('d64b7fed-867a-44a2-bf84-8e1013fc26e0','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjIyNiwiZXhwIjoxNzU5NDA2NTI2fQ._kIPZJwb80i_7tH8CIslqUyG8s7tb-V1SBVfn-7Qsrw','2025-10-02 12:02:06.959',1,'2025-10-02 11:57:06.961','2025-10-02 11:57:06.959'),('d77e2d50-911f-4a11-8706-f08879a03615','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMwNTMxOCwiZXhwIjoxNzYxODk3MzE4fQ.Fy5OD9RRe_iUZckkfgCKgcAx31rsIiegYDUwW0E_eQM','2025-10-08 07:55:18.035',1,'2025-10-01 07:55:18.038','2025-10-01 07:55:18.035'),('d9c02a12-3dea-4198-8455-342d3ff511a6','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA1OTA2MCwiZXhwIjoxNzYxNjUxMDYwfQ.oqEsTv39okJpcweeRSsGZtdRiOdIfQO6RD35mgl1bsk','2025-10-05 11:31:00.249',1,'2025-09-28 11:31:00.254','2025-09-28 11:31:00.250'),('db84c2b4-c0b7-4233-a7ed-98f690326c2f','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwODg0NCwiZXhwIjoxNzU5NDA5MTQ0fQ.lPKIRu0QdoIfeW8kewVktfEUxrThYBlXnADzHupfV4g','2025-10-02 12:45:44.684',1,'2025-10-02 12:40:44.686','2025-10-02 12:40:44.684'),('dc4e9134-57f2-45b0-a87c-771aba6bfba6','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwMTczNywiZXhwIjoxNzYwMjA2NTM3fQ.pS3xwqps17U3XBaqxYofrECJiGpKKU92o7E2kFKMXH4','2025-10-11 18:15:37.075',0,'2025-10-04 18:15:37.076','2025-10-04 18:15:37.075'),('de754a71-aaf1-42d6-b3d6-af0aff495aaa','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODU2MTk5MywiZXhwIjoxNzYxMTUzOTkzfQ.ggJZAZOG3uyZFdc3Oy82YNQmTiGnFgwZohlrGc89HuQ','2025-09-29 17:26:33.300',1,'2025-09-22 17:26:33.301','2025-09-22 17:26:33.300'),('df28c66a-4a8f-4070-8e1c-bd1c28de7829','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMyNDAzMSwiZXhwIjoxNzYxOTE2MDMxfQ.Jnm_ol8pw0L6Oqu_DrgLEdtO3bDE_LnYYCvirc3XNIM','2025-10-08 13:07:11.259',1,'2025-10-01 13:07:11.262','2025-10-01 13:07:11.259'),('e0d63d51-7116-423d-9d36-14b3650c67e9','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5OTM1NywiZXhwIjoxNzYwMjA0MTU3fQ.qIsl98fnjnhbcZGqwDNcgvWS4KgbTMG_bAIzpG0O6lE','2025-10-11 17:35:57.278',0,'2025-10-04 17:35:57.279','2025-10-04 17:35:57.278'),('e0d6a52c-3b19-492e-b684-8bd05391be91','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMzNzQzMSwiZXhwIjoxNzYxOTI5NDMxfQ.IQhe8eUv3L62AxOvU3D_WSwLXUIYLSUxs_wZq7_QssA','2025-10-08 16:50:31.467',1,'2025-10-01 16:50:31.469','2025-10-01 16:50:31.467'),('e44c89d1-337a-4fc9-a133-b5fb7c595da9','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwOTcyMywiZXhwIjoxNzYwMDE0NTIzfQ.3s5rFObffE-4y-PBb9PDS0Hd8Us2Xj-j4TU7yysZEdI','2025-10-02 13:00:23.135',1,'2025-10-02 12:55:23.137','2025-10-02 12:55:23.135'),('e5787a4b-59d1-4e6d-a5f7-52781ed99cee','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTI5NTY0NiwiZXhwIjoxNzYxODg3NjQ2fQ.q9W_z55cq2Yq8iGZp-Iz4pCo7Oie00o5OgrNX60ZMwI','2025-10-08 05:14:06.071',1,'2025-10-01 05:14:06.072','2025-10-01 05:14:06.071'),('e633482c-2194-4523-8bdc-0afab924b39f','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY0NzAyOCwiZXhwIjoxNzYwMjUxODI4fQ.L8-3z2Ugovzqnvf9fj6ToELuKC-_WWHLjbyT61CwXpU','2025-10-12 06:50:28.040',1,'2025-10-05 06:50:28.043','2025-10-05 06:50:28.040'),('e720a6ea-7f78-49dd-9bd7-a1184ab9bd4f','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMzNDUwMCwiZXhwIjoxNzYxOTI2NTAwfQ.CG-2w6AVVBnHXEHBS1Q8QvHrp0LAIKNaz0gDhHWaQy0','2025-10-08 16:01:40.271',1,'2025-10-01 16:01:40.273','2025-10-01 16:01:40.271'),('e7b607ba-0182-436b-afd2-2836b97ebce6','0ca8e031-2298-4443-9b3f-8fbe3ec6cd31','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwY2E4ZTAzMS0yMjk4LTQ0NDMtOWIzZi04ZmJlM2VjNmNkMzEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1ODk5NDIyMCwiZXhwIjoxNzYxNTg2MjIwfQ.GD_jCjF7f2pe-hzqklChGuCIksbqdYxoHMTLDSOMzqY','2025-10-04 17:30:20.086',1,'2025-09-27 17:30:20.089','2025-09-27 17:30:20.086'),('e9b2d6c4-50bf-44bc-86c7-1bb035b16260','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU5NDc0OCwiZXhwIjoxNzYwMTk5NTQ4fQ.maazGmv1Hj2Rf3_HycY65BW9dX82YUpj2hFzziRNyeg','2025-10-11 16:19:08.368',1,'2025-10-04 16:19:08.371','2025-10-04 16:19:08.368'),('ee02d42e-8c29-4ff3-a0dc-b23c617902d6','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTA0NzgxOSwiZXhwIjoxNzYxNjM5ODE5fQ.5lel7cYpvY0yzNGn_qIkb_Wk-V_3X9Q_DFil8NBUStQ','2025-10-05 08:23:39.966',1,'2025-09-28 08:23:39.968','2025-09-28 08:23:39.966'),('f175fd16-3acc-42a6-851f-14493cb6ce8b','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY1NzQ3MiwiZXhwIjoxNzYwMjYyMjcyfQ.8kIQzI9WoPip0MvI9bbNW3SvBb5dRs1cVnt6qOi2dbo','2025-10-12 09:44:32.059',0,'2025-10-05 09:44:32.062','2025-10-05 09:44:32.060'),('f3e3e985-03b6-42a5-8408-28182a6639a9','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNzM1MiwiZXhwIjoxNzU5NDA3NjUyfQ.Xf6sCL6hjQIB2Q8VcnS2xfpFLXTA545sVwFJrYYiIGU','2025-10-02 12:20:52.766',1,'2025-10-02 12:15:52.767','2025-10-02 12:15:52.766'),('f615bcb4-8ead-497e-ae3d-79c40e418ba0','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjIzOSwiZXhwIjoxNzU5NDA2NTM5fQ.Pe5A8vVvq0u9FEo25_s7_fFclSLLclCY0Up0BrxLTw0','2025-10-02 12:02:19.209',1,'2025-10-02 11:57:19.211','2025-10-02 11:57:19.209'),('f617cd16-5c78-4882-9fb3-3c94002f29db','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTYwNDEwMSwiZXhwIjoxNzYwMjA4OTAxfQ.Fa11t0Ab9v0PZhN7QI6g5h2fqol5L4qvMRhbV81_0Go','2025-10-11 18:55:01.583',1,'2025-10-04 18:55:01.584','2025-10-04 18:55:01.583'),('f6d5f035-65d6-4b0e-ac6f-206b38986dfe','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQyNzA1MywiZXhwIjoxNzYwMDMxODUzfQ.iA4OkjjPmfzFa3j8BRcDj3LVVquD4CuR6e-aM5CShCE','2025-10-09 17:44:13.607',1,'2025-10-02 17:44:13.610','2025-10-02 17:44:13.607'),('f7e20535-3491-4446-b9e2-35f160f957bc','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY2NDg1MiwiZXhwIjoxNzYwMjY5NjUyfQ.0WqYCf5tDWSaLZPfndUDRebEY2QC2Ay41tv49JHvBZg','2025-10-12 11:47:32.050',0,'2025-10-05 11:47:32.054','2025-10-05 11:47:32.050'),('f9081782-e734-4a28-aa20-cbde2ff4ef2f','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTU1ODk0NCwiZXhwIjoxNzYwMTYzNzQ0fQ.iQ1BfCFGC5fmodcG4SVSyWrleJQHzKX5TD6VWHB7zMs','2025-10-11 06:22:24.661',1,'2025-10-04 06:22:24.660','2025-10-04 06:22:24.662'),('f989f41e-9510-4219-82ee-cac1090c76eb','fd9c978d-9e49-4ec6-a057-a951fc1d6a9b','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZDljOTc4ZC05ZTQ5LTRlYzYtYTA1Ny1hOTUxZmMxZDZhOWIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTAzODE0OSwiZXhwIjoxNzYxNjMwMTQ5fQ.8YSBdQ5AaC8Jth9EGTO7kLcpNeA4LG22ziMgkcyvMus','2025-10-05 05:42:29.680',1,'2025-09-28 05:42:29.676','2025-09-28 05:42:29.680'),('fabfc455-ecef-4d4b-be9d-302bb7ce381d','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTQwNjE5NywiZXhwIjoxNzU5NDA2NDk3fQ.yiR_lzSZnoUdGAeGZcg7TbSVzW0Bmti4VPoh2SFWxSQ','2025-10-02 12:01:37.181',1,'2025-10-02 11:56:37.183','2025-10-02 11:56:37.181'),('ff10c5a9-647a-4aa6-ab88-4e75be63d264','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTY0MzQyNywiZXhwIjoxNzYwMjQ4MjI3fQ.f2ej9h1IM3cV7Ah5XxTVAZr9bBtNMsR6NfpWiS1Tehw','2025-10-12 05:50:27.283',0,'2025-10-05 05:50:27.286','2025-10-05 05:50:27.283'),('ff40946f-10dd-4a16-ad16-48b3e3101c9d','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc1OTMxMTMzNiwiZXhwIjoxNzYxOTAzMzM2fQ.PZnd7INCK92iA-jQPKUN-2oC-hD8lG3DI_9NtWYDF34','2025-10-08 09:35:36.055',1,'2025-10-01 09:35:36.057','2025-10-01 09:35:36.055');
/*!40000 ALTER TABLE `refreshtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requirement`
--

DROP TABLE IF EXISTS `requirement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requirement` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `collegeProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `budgetType` enum('FIXED','RANGE','NEGOTIABLE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FIXED',
  `deadline` datetime(3) DEFAULT NULL,
  `isUrgent` tinyint(1) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `experience` text COLLATE utf8mb4_unicode_ci,
  `requiredSkills` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `Requirement_budget_idx` (`budget`),
  KEY `Requirement_category_idx` (`category`),
  KEY `Requirement_collegeProfileId_idx` (`collegeProfileId`),
  KEY `Requirement_deadline_idx` (`deadline`),
  KEY `Requirement_isActive_idx` (`isActive`),
  KEY `Requirement_isUrgent_idx` (`isUrgent`),
  KEY `Requirement_subcategory_idx` (`subcategory`),
  CONSTRAINT `Requirement_collegeProfileId_fkey` FOREIGN KEY (`collegeProfileId`) REFERENCES `collegeprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requirement`
--

LOCK TABLES `requirement` WRITE;
/*!40000 ALTER TABLE `requirement` DISABLE KEYS */;
INSERT INTO `requirement` VALUES ('cmg7j9t6s00030m5s1cpa319d','48159599-ced3-44e6-8706-e0e474bf4e31','Java edited','Test edited','CYBERSECURITY',NULL,9999999.00,'FIXED','2025-10-16 00:00:00.000',1,1,'2025-10-01 05:16:01.156','2025-10-01 14:56:06.986','c cvccv','vcvcc'),('cmg7mk3tc00030mwoxomtt3f1','48159599-ced3-44e6-8706-e0e474bf4e31','New','azzaza edited','Test edited',NULL,100.00,'FIXED',NULL,0,0,'2025-10-01 06:48:00.334','2025-10-01 14:47:54.899','x cxzxz','gfgf'),('cmg8avn0u00010m3cwp3jsmjz','48159599-ced3-44e6-8706-e0e474bf4e31','test new','vbbf','DATA_SCIENCE_AI',NULL,98.00,'FIXED',NULL,0,1,'2025-10-01 18:08:49.227','2025-10-01 18:08:49.225','',''),('cmg9amrzl00010me46mxperix','48159599-ced3-44e6-8706-e0e474bf4e31','NKNKN','M M ','DATA_SCIENCE_AI',NULL,0.00,'FIXED',NULL,0,1,'2025-10-02 10:49:41.896','2025-10-02 10:49:41.890','',''),('cmg9anato00030me4atga8ly3','48159599-ced3-44e6-8706-e0e474bf4e31','M N,',' M M','CYBERSECURITY',NULL,0.00,'FIXED',NULL,0,1,'2025-10-02 10:50:06.348','2025-10-02 10:50:06.345','',''),('cmg9anmka00050me45moeri6n','48159599-ced3-44e6-8706-e0e474bf4e31','MMNHH','MN','BUSINESS_STRATEGY',NULL,0.00,'FIXED',NULL,0,1,'2025-10-02 10:50:21.562','2025-10-02 10:50:21.559','',''),('cmgbwgfpx00090mvkp9gdw6w9','48159599-ced3-44e6-8706-e0e474bf4e31','Java developer','We are looking for a passionate and skilled Java Developer to design, develop, and maintain scalable, high-performance applications. You will work closely with cross-functional teams to deliver robust backend systems, write clean and efficient code, and contribute to architectural decisions.\n\nThe ideal candidate has hands-on experience with Spring Boot, RESTful APIs, and SQL/NoSQL databases, along with a solid understanding of object-oriented design principles.','SOFTWARE_DEVELOPMENT',NULL,500000.00,'FIXED','2025-10-15 00:00:00.000',1,1,'2025-10-04 06:36:10.003','2025-10-05 07:31:05.408','1 - 3 years','Core Java, Spring boot, Html, css ,Js'),('cmgbwgzir000b0mvkcwg161oy','48159599-ced3-44e6-8706-e0e474bf4e31','test','test','CYBERSECURITY',NULL,1000.00,'FIXED','2025-10-06 00:00:00.000',0,1,'2025-10-04 06:36:35.667','2025-10-04 06:36:35.665','',''),('cmgbwhr9p000d0mvkvnx4s241','48159599-ced3-44e6-8706-e0e474bf4e31','test','tetest','DATA_SCIENCE_AI',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 06:37:11.629','2025-10-04 06:37:11.628','',''),('cmgbxzekc000f0mvkk3kepqfa','48159599-ced3-44e6-8706-e0e474bf4e31','test','dcdcd','SOFTWARE_DEVELOPMENT',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 07:18:54.584','2025-10-04 07:18:54.581','',''),('cmgby20vo00010ml0kmsu8brw','48159599-ced3-44e6-8706-e0e474bf4e31','dsfedsfs','bfdg','DATA_SCIENCE_AI',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 07:20:56.818','2025-10-04 07:20:56.816','',''),('cmgby4vuq00030ml0zixbvtvw','48159599-ced3-44e6-8706-e0e474bf4e31','jgjg','hhk','DATA_SCIENCE_AI',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 07:23:10.274','2025-10-05 11:02:19.767','','Java, python, sql'),('cmgby7af400050ml0d4q2ss0p','48159599-ced3-44e6-8706-e0e474bf4e31','hgfgug','ffvrrvd','DATA_SCIENCE_AI',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 07:25:02.464','2025-10-04 07:25:02.462','',''),('cmgby84h900070ml0eb26a2o7','48159599-ced3-44e6-8706-e0e474bf4e31','zscs','zxassxs','CYBERSECURITY',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 07:25:41.422','2025-10-04 07:25:41.421','',''),('cmgby98ht00090ml0rah798sf','48159599-ced3-44e6-8706-e0e474bf4e31','dvdvd','evdsbbd','CYBERSECURITY',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 07:26:33.281','2025-10-04 07:26:33.279','',''),('cmgclh54x00010mmw73fwaju0','48159599-ced3-44e6-8706-e0e474bf4e31','Recomendation match requirement','Java, python, data structure','SOFTWARE_DEVELOPMENT',NULL,0.00,'FIXED',NULL,0,1,'2025-10-04 18:16:33.344','2025-10-04 18:22:38.816','','Java, Sql, Python, Data structures');
/*!40000 ALTER TABLE `requirement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expertProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `priceType` enum('FIXED','HOURLY','DAILY','NEGOTIABLE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FIXED',
  `duration` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Service_category_idx` (`category`),
  KEY `Service_expertProfileId_idx` (`expertProfileId`),
  KEY `Service_isActive_idx` (`isActive`),
  KEY `Service_price_idx` (`price`),
  KEY `Service_subcategory_idx` (`subcategory`),
  CONSTRAINT `Service_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `expertprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `expiresAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Session_token_key` (`token`),
  KEY `Session_expiresAt_idx` (`expiresAt`),
  KEY `Session_isActive_idx` (`isActive`),
  KEY `Session_token_idx` (`token`),
  KEY `Session_userId_idx` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
INSERT INTO `session` VALUES ('0086e23e-7990-4885-b92e-9dc18374e737','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzEwMDQxLCJleHAiOjE3NTkzMTcyNDF9.iAAh5fUqi10ArvRv4ppxaa_m1TR-MjF0mxaq24N-fqg',NULL,NULL,'2025-10-01 11:14:01.919',0,'2025-10-01 09:14:01.921','2025-10-01 09:14:01.919'),('011075aa-a4fd-47b3-a7cc-90a7d4e17ed5','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NTYyMjYwLCJleHAiOjE3NTg1Njk0NjB9.M2xdz5Rc-jVHoDEFAQbXQQoFAbyaDznNs6YjvldegqQ',NULL,NULL,'2025-09-22 19:31:00.749',0,'2025-09-22 17:31:00.750','2025-09-22 17:31:00.749'),('02a27de2-2014-41eb-b845-5802376ba264','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjM1OTk3LCJleHAiOjE3NTk2NDMxOTd9.dW_vP-VZTFRHL9bCGBHPoPdSnuatDTiKMU4otPHjjdM',NULL,NULL,'2025-10-12 03:46:37.813',1,'2025-10-05 03:46:37.815','2025-10-05 03:46:37.813'),('02ddc3fe-1bd0-4476-9b2f-1cf70a1165f7','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA4NTY5LCJleHAiOjE3NTk0MDg3NDl9.OGJKWxC3TjblW5WaW7A1F8uNkk7OhJ2eGxTYt0-Tkls',NULL,NULL,'2025-10-02 12:41:09.551',0,'2025-10-02 12:36:09.554','2025-10-02 12:36:09.551'),('03e42fe6-77e7-47c0-a56a-6d73f7a39716','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjYwNTczLCJleHAiOjE3NTk2Njc3NzN9.JxXGsYF4a_4S0g-hsX163ugEWFWgDC4tjhnd1IeDy5E',NULL,NULL,'2025-10-12 10:36:13.263',1,'2025-10-05 10:36:13.266','2025-10-05 10:36:13.263'),('046a6b05-c227-4136-bb87-8d84ad7f4d10','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzIzNTU3LCJleHAiOjE3NTkzMzA3NTd9.NRTqSVWgbl19GV5GZTet6_NM-wvp2fxSxYdbs04jZ70',NULL,NULL,'2025-10-01 14:59:17.683',0,'2025-10-01 12:59:17.685','2025-10-01 12:59:17.683'),('0a049c05-3646-408f-b2c7-94ed8e7565fb','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk5NzI5LCJleHAiOjE3NTk2MDY5Mjl9.2VME3rhiT8yUSt69gc7W3e93ESHxOUHPn96vxxPT5rU',NULL,NULL,'2025-10-11 17:42:09.943',1,'2025-10-04 17:42:09.945','2025-10-04 17:42:09.943'),('0a459670-dfd5-41fa-8a32-87954563bc6c','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MjE5LCJleHAiOjE3NTk0MDYzOTl9.HcMYV5ZahZZ3mKmM-OrLe6YxPbJEsgB927LxJd6w3ww',NULL,NULL,'2025-10-02 12:01:59.140',0,'2025-10-02 11:56:59.142','2025-10-02 11:56:59.140'),('121195c7-4ba9-4dca-9c54-5917fc8cdad8','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MjE1LCJleHAiOjE3NTk0MDYzOTV9.IWTB9by_BTBVjtGoHaNIV8XOCiwzgmiD7qKg1Q4Am2Q',NULL,NULL,'2025-10-02 12:01:55.937',0,'2025-10-02 11:56:55.939','2025-10-02 11:56:55.937'),('1286509e-6924-4ff5-b0d3-7fba0fd32b3b','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4ODYwLCJleHAiOjE3NTk2MDYwNjB9.7p5n7AlxAkcCUH7K5WInxpY3f1hqBDmI_NS2G14Toh8',NULL,NULL,'2025-10-11 17:27:40.218',0,'2025-10-04 17:27:40.220','2025-10-04 17:27:40.218'),('1551d4f6-ef57-4ea3-b26f-345bda19b67a','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAwNzIzLCJleHAiOjE3NTk2MDc5MjN9.TXHf315xhZNocAraKdpYAokh9coQ9qb2aLkwU8MlfHM',NULL,NULL,'2025-10-11 17:58:43.839',1,'2025-10-04 17:58:43.841','2025-10-04 17:58:43.839'),('17e46cca-5a4b-4de0-a3b1-413c3b346159','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzMwNjc2LCJleHAiOjE3NTkzMzc4NzZ9.z8-PSUiJoOekpT98KDXuYQUtMAcPx15vHcb9b7PL4yY',NULL,NULL,'2025-10-01 16:57:56.148',0,'2025-10-01 14:57:56.150','2025-10-01 14:57:56.148'),('1a03891c-0b76-4638-acd4-a9b502398c77','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzI5NjM3LCJleHAiOjE3NTkzMzY4Mzd9.UOMoQ4QQAWgJ2l-MPtnaTwiUXj_jd5umVEBJ55Ge82E',NULL,NULL,'2025-10-01 16:40:37.316',0,'2025-10-01 14:40:37.319','2025-10-01 14:40:37.317'),('1b88e943-7bc6-4019-abaf-d2958f4fceef','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjYyMDkwLCJleHAiOjE3NTk2NjkyOTB9.5G5Y3bwRdpTOTAQzcw7VFt3NLneteIvE-Lht7ZR3-mU',NULL,NULL,'2025-10-12 11:01:30.216',1,'2025-10-05 11:01:30.218','2025-10-05 11:01:30.216'),('1d92af65-4421-48b7-978d-7a0d5b388a38','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzI0MDMxLCJleHAiOjE3NTkzMzEyMzF9.CZRmtdZQyrti4Z18tl1ei6Jpr6F1p-kpycbTK1qLKSM',NULL,NULL,'2025-10-01 15:07:11.287',0,'2025-10-01 13:07:11.290','2025-10-01 13:07:11.287'),('2328b00f-e5fe-4db5-a61f-51ccb0b20784','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAxNzM3LCJleHAiOjE3NTk2MDg5Mzd9.mTRZs7Uw1-86Mvt8dCCOyOr7RES3myaCrWQQwmZMpmg',NULL,NULL,'2025-10-11 18:15:37.108',1,'2025-10-04 18:15:37.109','2025-10-04 18:15:37.108'),('26906bf9-81c4-4f88-8712-a4ae1abf0f0a','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDQ4NTA4LCJleHAiOjE3NTkwNTU3MDh9.Xlsj4OGcicpmn0Tgy_Yj8IaAG4kgvx4ziYnDhJFu0dc',NULL,NULL,'2025-09-28 10:35:08.207',0,'2025-09-28 08:35:08.210','2025-09-28 08:35:08.207'),('2d95c054-fd65-415a-b8db-7ac979045b45','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MjI2LCJleHAiOjE3NTk0MDY0MDZ9.4ZaF_eY8nWuZBqriIlYYA4b8oGuw9Gdvg2FEaIhZwjM',NULL,NULL,'2025-10-02 12:02:06.965',0,'2025-10-02 11:57:06.967','2025-10-02 11:57:06.965'),('2e6059bd-4b53-4b50-a775-60b45ca9e048','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4ODM0LCJleHAiOjE3NTk2MDYwMzR9.hVXwIM5Qd103GDoEfJ6dVbu2uyc82hHQC19AWT_fF-M',NULL,NULL,'2025-10-11 17:27:14.872',1,'2025-10-04 17:27:14.874','2025-10-04 17:27:14.873'),('3191efb3-0464-46ac-9518-bb7bd097324d','54f3a261-9dd1-4a70-ad85-78f9395af57e','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NGYzYTI2MS05ZGQxLTRhNzAtYWQ4NS03OGY5Mzk1YWY1N2UiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4OTkzOTIzLCJleHAiOjE3NTkwMDExMjN9.mS5cpGmMZ8w7-uEUUK3YBX54f_4LpN36oVPxurWVZ_o',NULL,NULL,'2025-09-27 19:25:23.273',0,'2025-09-27 17:25:23.277','2025-09-27 17:25:23.275'),('319afa21-2d9e-46c0-b562-00f0b043c0fe','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTg3NDEwLCJleHAiOjE3NTk1OTQ2MTB9.7umUUpsdMMyhx6Kp1yKZkWt_KwfpwbDg-Tqf3b3lWm4',NULL,NULL,'2025-10-11 14:16:50.357',0,'2025-10-04 14:16:50.358','2025-10-04 14:16:50.357'),('33e8aafb-49a0-4a15-9595-e842e820b585','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4ODc5LCJleHAiOjE3NTk2MDYwNzl9.tCkLnIw7tnsS61-_YiiE-BlLEDtx1oBZh9DPbKtRSQ4',NULL,NULL,'2025-10-11 17:27:59.488',1,'2025-10-04 17:27:59.490','2025-10-04 17:27:59.488'),('36a6ee46-9565-46bc-85d6-dfa6c347dec4','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDExNDY0LCJleHAiOjE3NTk0MTg2NjR9.ZpueJee9NgPVaGEBlyyhwBhdg657QJLqdpY98-4vRrc',NULL,NULL,'2025-10-09 13:24:24.921',0,'2025-10-02 13:24:24.923','2025-10-02 13:24:24.921'),('38fd6fca-2c11-4dea-b872-b3a4f3237241','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NTY2MzMzLCJleHAiOjE3NTg1NzM1MzN9.z42s3WAVzhBoB_xBM6KIvJJ028C1RzU8iUwZH-afKrs',NULL,NULL,'2025-09-22 20:38:53.608',0,'2025-09-22 18:38:53.611','2025-09-22 18:38:53.609'),('39aaff36-4e3a-45f4-85e6-3214bf6830d8','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4NDUwLCJleHAiOjE3NTk2MDU2NTB9.Qf47Vhq3CwdW4OI9O-6P7YpKkvhtAsF1yPN0JLEf2m8',NULL,NULL,'2025-10-11 17:20:50.165',0,'2025-10-04 17:20:50.166','2025-10-04 17:20:50.165'),('39d51074-75eb-41cb-8a44-597e81d3c9ae','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDI3MDUzLCJleHAiOjE3NTk0MzQyNTN9.KVrNreCzlAlOVEyHbkN22y_R1BBxuvYqNEnnQB8pNkQ',NULL,NULL,'2025-10-09 17:44:13.631',0,'2025-10-02 17:44:13.633','2025-10-02 17:44:13.631'),('3ac1d54b-f73e-4b87-a139-729d1b78ae4d','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjU3NDcyLCJleHAiOjE3NTk2NjQ2NzJ9.PDGCROFKiXPaIiNDtyBo8_3igeni7wVIuVCHhxbaka0',NULL,NULL,'2025-10-12 09:44:32.079',1,'2025-10-05 09:44:32.082','2025-10-05 09:44:32.080'),('3e1ef474-1066-4f46-86e9-a84d529ab22f','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTkzNzQ1LCJleHAiOjE3NTk2MDA5NDV9.NrGChWrnqiLv5sR23R0smnj667zXHM9ivBeBQ-GdkDA',NULL,NULL,'2025-10-11 16:02:25.840',0,'2025-10-04 16:02:25.842','2025-10-04 16:02:25.840'),('47955fea-36cc-4627-a625-c93387a89249','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDIzMzM4LCJleHAiOjE3NTk0MzA1Mzh9.-EWJS2zap0xFMf8pJPUz_Zdic4kD6QXS5Ekn6qAkwHk',NULL,NULL,'2025-10-09 16:42:18.510',0,'2025-10-02 16:42:18.512','2025-10-02 16:42:18.510'),('48eed0e7-f76a-4403-b071-29f39f16d04d','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjUwMDYxLCJleHAiOjE3NTk2NTcyNjF9.AcorAgHaqerCs7xkhRfacmnXkiYhg-3pXPVqrAHXmU0',NULL,NULL,'2025-10-12 07:41:01.969',1,'2025-10-05 07:41:01.971','2025-10-05 07:41:01.970'),('4d2d689e-741a-4df2-857a-358357811175','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAxNDQ4LCJleHAiOjE3NTk2MDg2NDh9.R9XXxsCUavJMu5hegLPWDMmVgyWGW18EHzP-c6q4jaE',NULL,NULL,'2025-10-11 18:10:48.670',1,'2025-10-04 18:10:48.672','2025-10-04 18:10:48.670'),('4ebe4692-a442-4f53-9ae0-ee4410a950ca','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA5MDE1LCJleHAiOjE3NTk0MDkxOTV9.61GKCuG5e0ETc030ZjpakTGla5QAaseG31dWNBrc1As',NULL,NULL,'2025-10-02 12:48:35.830',0,'2025-10-02 12:43:35.832','2025-10-02 12:43:35.830'),('52e2eeac-f88e-4135-ba73-681645f93d39','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA3ODk2LCJleHAiOjE3NTk0MDgwNzZ9.B31eX3gvmVNdKi6okYwpNofPwAFrLYofGUlGjuCLd98',NULL,NULL,'2025-10-02 12:29:56.903',0,'2025-10-02 12:24:56.905','2025-10-02 12:24:56.904'),('5a7f9ed8-c05e-4cc0-9b77-3c915b0b1b39','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDU5MDk2LCJleHAiOjE3NTkwNjYyOTZ9.dDiNrwmqEdAzJNiV0Z4A8W9vFgJmbgvYgA21nrAt_eU',NULL,NULL,'2025-09-28 13:31:36.469',0,'2025-09-28 11:31:36.471','2025-09-28 11:31:36.469'),('5b88c14f-068e-4538-8cad-59385b47185c','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4NTM4LCJleHAiOjE3NTk2MDU3Mzh9.u9C8lDEoBZWhFnRhB9CgOt6WKCUi2R5rd4tuKhXY0WA',NULL,NULL,'2025-10-11 17:22:18.700',0,'2025-10-04 17:22:18.702','2025-10-04 17:22:18.700'),('5d1ecac0-104f-43bb-bb8d-c7b01ca26388','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5Mjk1NjA0LCJleHAiOjE3NTkzMDI4MDR9.ARTd5YQF30F3c7G-MIOV8cOXyvEmNinzO2mZdBAEIy8',NULL,NULL,'2025-10-01 07:13:25.019',0,'2025-10-01 05:13:25.021','2025-10-01 05:13:25.019'),('6208944f-79b3-48f3-b9ca-775d4dba3a93','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDI5OTYzLCJleHAiOjE3NTk0MzcxNjN9.y9ajPHntypqJTQ29PuMpQ8voZiNQlHJ1dfJ5GWnUyvQ',NULL,NULL,'2025-10-09 18:32:43.889',0,'2025-10-02 18:32:43.893','2025-10-02 18:32:43.890'),('62bc90fb-07cb-46b7-8881-7bc71e36a320','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDQ3ODE5LCJleHAiOjE3NTkwNTUwMTl9.WD_EjEnnwiKFU2YjEWSIC9_dUWKWNvCmYCsSN6127VE',NULL,NULL,'2025-09-28 10:23:39.974',0,'2025-09-28 08:23:39.976','2025-09-28 08:23:39.974'),('685b32a2-3b7c-4557-9ab2-8c4b676212f3','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzI5NjcwLCJleHAiOjE3NTkzMzY4NzB9.GFjFNPqy5fbSFWU3qzuLIfVpjqSXChEiDBS9RZsoZVc',NULL,NULL,'2025-10-01 16:41:10.838',0,'2025-10-01 14:41:10.841','2025-10-01 14:41:10.838'),('6fcb2ccc-fad3-4856-a67a-ae7b57ab28ad','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk1NTMxLCJleHAiOjE3NTk2MDI3MzF9.PFAR7iu5xcmOhON6C2M3NxjOixLz8hTjzSxLXWpGYko',NULL,NULL,'2025-10-11 16:32:11.843',0,'2025-10-04 16:32:11.845','2025-10-04 16:32:11.843'),('70a66c1d-1a48-4eb6-a247-4db1dbe66e9f','237162ea-f15e-47d9-91e0-baf6ccc026cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMzcxNjJlYS1mMTVlLTQ3ZDktOTFlMC1iYWY2Y2NjMDI2Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4OTk0MzQ1LCJleHAiOjE3NTkwMDE1NDV9.q1SUZbgKfBB_FGQK0veFAhNz-zyWmnkSTjEfSWhJjX8',NULL,NULL,'2025-09-27 19:32:25.609',0,'2025-09-27 17:32:25.611','2025-09-27 17:32:25.609'),('7302c2b9-7f8d-4df9-a08c-066ae7c23952','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDIzNTA2LCJleHAiOjE3NTk0MzA3MDZ9.qoP-VpoPtXDeIRaBInccLlIZHiFXgpZG1I5PmpAk9QQ',NULL,NULL,'2025-10-09 16:45:06.100',0,'2025-10-02 16:45:06.102','2025-10-02 16:45:06.100'),('741a1a5b-b92c-470d-b4a8-496bd71e96fa','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDAwNDkwLCJleHAiOjE3NTk0MDc2OTB9.yeeaS05-1bvpBknrrsAfZ4tnqHB_GiD4IMGYlG6DMcM',NULL,NULL,'2025-10-02 12:21:30.300',0,'2025-10-02 10:21:30.301','2025-10-02 10:21:30.300'),('758af7a7-f45a-4e19-bb8f-0ef5b1f76d47','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA1Mjc1LCJleHAiOjE3NTk0MTI0NzV9.CfhitTWR5Nq5QhxpSog5-tzVjfq4keYEHmy5NzU1nww',NULL,NULL,'2025-11-01 11:41:15.968',0,'2025-10-02 11:41:15.971','2025-10-02 11:41:15.968'),('767fdc35-1132-4af6-82ec-45e8596ac6f3','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NjQzMzUzLCJleHAiOjE3NTg2NTA1NTN9.gIN5BrjxnSgRjzw00J3cZ8fEniEalevi5IUbcrWnGnE',NULL,NULL,'2025-09-23 18:02:33.101',0,'2025-09-23 16:02:33.102','2025-09-23 16:02:33.101'),('76ec2e29-ec93-4868-bd45-1bee2327ab1b','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjM5NzYyLCJleHAiOjE3NTk2NDY5NjJ9.xjx9hP1B-05yqrdJKipkYjPhO0bTvr-SPtDfwzOGFVE',NULL,NULL,'2025-10-12 04:49:22.716',1,'2025-10-05 04:49:22.718','2025-10-05 04:49:22.716'),('7c4158ed-eaad-41b4-bac5-2189ff9eb0e4','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTU5NTc1LCJleHAiOjE3NTk1NjY3NzV9.1U5wgF8dXJ81VKZQWVLXsWwegAsDW3vZqHMTwbQTyoE',NULL,NULL,'2025-10-11 06:32:55.208',0,'2025-10-04 06:32:55.207','2025-10-04 06:32:55.208'),('7d489b3e-6f37-43aa-8af0-0153409743f2','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzA1MzE4LCJleHAiOjE3NTkzMTI1MTh9.8Lx91o8DI5ZGlNiYSSHYVn3QWcn3ZtjmbL-7It3xxeA',NULL,NULL,'2025-10-01 09:55:18.059',0,'2025-10-01 07:55:18.061','2025-10-01 07:55:18.059'),('7de317de-cc92-4307-a096-8f100ea8f8d8','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4NDcwLCJleHAiOjE3NTk2MDU2NzB9.fvKIW9aoY4QFGHgeUwbeMVsN05Shij3jujwSLtRkorM',NULL,NULL,'2025-10-11 17:21:10.458',0,'2025-10-04 17:21:10.460','2025-10-04 17:21:10.458'),('83f67f27-f46c-4534-8f09-b2fc213a2454','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA1MDcwLCJleHAiOjE3NTk0MTIyNzB9.koEvGE_i0r1rzvDmUyvWOF3ZTbbmwgWmEEsO-Mo_o74',NULL,NULL,'2025-11-01 11:37:50.873',0,'2025-10-02 11:37:50.879','2025-10-02 11:37:50.874'),('84018722-99d1-42b9-a49a-f942069f940b','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzkzMjg1LCJleHAiOjE3NTk0MDA0ODV9.HEUkAbgZp8YKbMbor_IyDQt1loxyDIKJE6D4Ih3tU4o',NULL,NULL,'2025-10-02 10:21:25.835',0,'2025-10-02 08:21:25.837','2025-10-02 08:21:25.835'),('8432a8c9-169a-49ad-9707-db8493f50075','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjA0MTAxLCJleHAiOjE3NTk2MTEzMDF9.u0IXPypa8NueAAHU78tr-jdCJtb2rNQjP17ZZJPEsB8',NULL,NULL,'2025-10-11 18:55:01.589',1,'2025-10-04 18:55:01.590','2025-10-04 18:55:01.589'),('870dda76-4499-4104-9494-efe1626a4434','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAzNTE4LCJleHAiOjE3NTk2MTA3MTh9.jdtQkak_dclsWK_szvsYcZ2WUqjdLlvIo-vf0Itahbs',NULL,NULL,'2025-10-11 18:45:18.984',1,'2025-10-04 18:45:18.986','2025-10-04 18:45:18.984'),('8ae80240-b1f3-4853-acb4-1ce50c3fbc38','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk5NzY3LCJleHAiOjE3NTk2MDY5Njd9.bloVaJbEd8RAIewqqmzG0HvNaE3ypJnTtzNOuugGRAU',NULL,NULL,'2025-10-11 17:42:47.918',0,'2025-10-04 17:42:47.921','2025-10-04 17:42:47.918'),('8f7b5ca5-777f-408a-8b42-cba9c4233816','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA0MTYzLCJleHAiOjE3NTk0MTEzNjN9.YFzXxF7QIPfXCxJWdGJQ93iZWRMrJBGm2SDJG650WUY',NULL,NULL,'2025-10-02 13:22:43.413',0,'2025-10-02 11:22:43.415','2025-10-02 11:22:43.414'),('9100698a-75ae-4e70-ac0c-573bbf115721','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MTk3LCJleHAiOjE3NTk0MDYzNzd9.v35QDXZ43MQBIaBG-zF-DWOOYf8Lvf9KiIeLAgdZPvY',NULL,NULL,'2025-10-02 12:01:37.196',0,'2025-10-02 11:56:37.198','2025-10-02 11:56:37.196'),('919ad37c-d578-46e2-828a-c1270322b997','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4MjI0LCJleHAiOjE3NTk2MDU0MjR9.eu5iLfRmbxPItGPZoRo8dlFxBK5Y3VgHWOnMU7UEpys',NULL,NULL,'2025-10-11 17:17:04.443',0,'2025-10-04 17:17:04.445','2025-10-04 17:17:04.443'),('94b5c7e0-1eb0-42cf-a2c2-66ef9741eecc','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDAyNzk2LCJleHAiOjE3NTk0MDk5OTZ9.wovhbjEjqK9mmS7EBJ6korrHBC-jtMkCQQZgAlqSd5I',NULL,NULL,'2025-10-02 12:59:56.628',0,'2025-10-02 10:59:56.630','2025-10-02 10:59:56.628'),('98fed184-e18e-4694-ab1f-806bd44203ca','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTU3NTk2LCJleHAiOjE3NTk1NjQ3OTZ9.73ndjUasdyHEB_sB09ROVJajZ-kEjQsl_bRSaB_jI2Q',NULL,NULL,'2025-10-11 05:59:56.565',0,'2025-10-04 05:59:56.568','2025-10-04 05:59:56.566'),('9cf2c33d-c117-45bf-b22a-e39916e5ddb2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA1MDg1LCJleHAiOjE3NTk0MTIyODV9.0PkemsPhX1WP1zfkPjg8_J_7bv7cvGE15d_CKiTrlUk',NULL,NULL,'2025-11-01 11:38:05.213',0,'2025-10-02 11:38:05.215','2025-10-02 11:38:05.213'),('a0cda3a7-e87e-40b2-bb4f-d5eafd2264cf','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4NTc3LCJleHAiOjE3NTk2MDU3Nzd9.QjbGLiCiBQTZsYt9hLyJliewL_2PIk-WY7wdvwGicts',NULL,NULL,'2025-10-11 17:22:57.586',0,'2025-10-04 17:22:57.589','2025-10-04 17:22:57.587'),('a186c711-4298-4ce9-9ef2-a022ea519ecf','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAwNzA4LCJleHAiOjE3NTk2MDc5MDh9.BmzG95HfWa6nbJKpSI_ZAwUqkhRqdWZDwRv9ZT46sDA',NULL,NULL,'2025-10-11 17:58:28.742',0,'2025-10-04 17:58:28.744','2025-10-04 17:58:28.742'),('a1e77d96-a4a4-40a0-96c8-c02145b828a2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MjA2LCJleHAiOjE3NTk0MDYzODZ9.-LWzjwP-qytkA_TD82iH_-REFZoUXophDYoasOn2Olg',NULL,NULL,'2025-10-02 12:01:46.089',0,'2025-10-02 11:56:46.090','2025-10-02 11:56:46.089'),('a50b138a-c791-4b59-9e77-35c1e2a93ee5','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk5MzU3LCJleHAiOjE3NTk2MDY1NTd9.41sMVOGu3lIzsXAWM0u1F4JDaAO43pw2f9-QD9Oqp90',NULL,NULL,'2025-10-11 17:35:57.289',1,'2025-10-04 17:35:57.291','2025-10-04 17:35:57.290'),('a5669e7f-c862-4ce8-a61e-a367926e2775','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDYzNjE4LCJleHAiOjE3NTkwNzA4MTh9.ReSnfIlQCFdQIvKKq6eglT66K2qLvkL6gO_oWr_v53I',NULL,NULL,'2025-09-28 14:46:58.531',0,'2025-09-28 12:46:58.533','2025-09-28 12:46:58.531'),('ab7eecdf-890e-44b1-bf04-01274dd5786f','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDI2NjIzLCJleHAiOjE3NTk0MzM4MjN9.PeD7ebsNYivHEFgijd9a2DwoWi9iy_KO4YxSmE0e4GU',NULL,NULL,'2025-10-09 17:37:03.493',0,'2025-10-02 17:37:03.496','2025-10-02 17:37:03.493'),('ad2a46ff-474f-4e1f-8f45-019eb2971d6d','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NTYxOTkzLCJleHAiOjE3NTg1NjkxOTN9.5AUlynEfJ6hvmczA1IVdMolv_1p8DfXTUXNtOeqnqOg',NULL,NULL,'2025-09-22 19:26:33.304',0,'2025-09-22 17:26:33.306','2025-09-22 17:26:33.305'),('af82da60-8ee3-45d5-8b95-e42da3d9caf9','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTk4Mzk4LCJleHAiOjE3NTk2MDU1OTh9.TDmQd63ItTHwyQvuro39AiXT8HhRkYphBx94D7QiJJk',NULL,NULL,'2025-10-11 17:19:58.349',0,'2025-10-04 17:19:58.351','2025-10-04 17:19:58.349'),('b09696d1-ba65-4cba-aa50-5dc43a91df0c','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDQwMjc1LCJleHAiOjE3NTkwNDc0NzV9.OpMkt_z-R8uJMdD0O1bBoTRoYXY_0wFCZYn0moRPuio',NULL,NULL,'2025-09-28 08:17:55.800',0,'2025-09-28 06:17:55.801','2025-09-28 06:17:55.800'),('b6791eeb-2334-40d4-843b-f8ba2bf0efb1','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA5NzMzLCJleHAiOjE3NTk0MTY5MzN9.H7q6Jq9RK6FfrXrsR9REtNsK2CF9adxxquI5Odo7VmY',NULL,NULL,'2025-10-09 12:55:33.745',0,'2025-10-02 12:55:33.747','2025-10-02 12:55:33.745'),('b6d3c590-f3ed-4dbd-8e74-48abb4b270ed','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MzAwLCJleHAiOjE3NTk0MDY0ODB9.zqsLc-z1hHiaoZ2IGZIr2nfHzyybZa0GsPUPyf4QRgU',NULL,NULL,'2025-10-02 12:03:20.008',0,'2025-10-02 11:58:20.009','2025-10-02 11:58:20.008'),('b799ac28-f48a-4cda-b2ac-11b357845892','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzAyODk4LCJleHAiOjE3NTkzMTAwOTh9.I8gNrNphRSec8i0w6wtC6GrTR-CYO4BmvtVeDdnz3sY',NULL,NULL,'2025-10-01 09:14:58.007',0,'2025-10-01 07:14:58.009','2025-10-01 07:14:58.007'),('b8dd6f7d-405b-44c6-b5c6-9466d7f1bbdb','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDQwMjIwLCJleHAiOjE3NTkwNDc0MjB9.8Al_gy1xOAhqD71atl-EJgY53cW7PphKjJ80C8rovm0',NULL,NULL,'2025-09-28 08:17:00.473',0,'2025-09-28 06:17:00.471','2025-09-28 06:17:00.473'),('b99bec34-ec62-41c0-bf0b-c9427c29b5ff','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAzMDU2LCJleHAiOjE3NTk2MTAyNTZ9.rnvfylX887sJx_YBpNQLln0U13bOlP5VgxBBd0Pr_g0',NULL,NULL,'2025-10-11 18:37:36.413',1,'2025-10-04 18:37:36.415','2025-10-04 18:37:36.413'),('b9f50db9-c6ef-4aa2-9567-281bef88459b','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzM3NDMxLCJleHAiOjE3NTkzNDQ2MzF9.jLQHgTXOXHKQjobkDO_QweZIkMmsdUg9t2XA4W9SFAM',NULL,NULL,'2025-10-01 18:50:31.474',0,'2025-10-01 16:50:31.475','2025-10-01 16:50:31.474'),('bbf3d23e-0a71-41c9-91fa-75b11efd4e65','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA3MzUyLCJleHAiOjE3NTk0MDc1MzJ9.wRZrzSY_gMvpihWuIgJOvTfgkPvZyu6qS_tmFVNi3nM',NULL,NULL,'2025-10-02 12:20:52.776',0,'2025-10-02 12:15:52.778','2025-10-02 12:15:52.776'),('c142a05f-2ed4-4662-9e47-9da0a201e9a8','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjA0MDc5LCJleHAiOjE3NTk2MTEyNzl9.Pm7Q-P3i1nHBZswH8Rv2kBWYU82hL9TuQkyum9P0HJQ',NULL,NULL,'2025-10-11 18:54:39.823',1,'2025-10-04 18:54:39.825','2025-10-04 18:54:39.823'),('c64c0abe-0bf5-4fd4-af1a-808c53aa3953','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA5NzIzLCJleHAiOjE3NTk0MTY5MjN9.LNUuGOimdVp8w0pulCjSO7RaGijZ4fRkoTTA4bzBcVU',NULL,NULL,'2025-10-09 12:55:23.161',0,'2025-10-02 12:55:23.164','2025-10-02 12:55:23.161'),('c70e70cf-e9fa-4de0-89ee-84cef6fce2b2','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5Mjk1NjQ2LCJleHAiOjE3NTkzMDI4NDZ9.EqNyBoQdsFYua_QdbCor1lewPs6QHR6zD3rt2Y4Ym3s',NULL,NULL,'2025-10-01 07:14:06.087',0,'2025-10-01 05:14:06.089','2025-10-01 05:14:06.087'),('c8282746-bcb7-437f-ac45-f3bf33e40db8','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjY3Njk1LCJleHAiOjE3NTk2NzQ4OTV9.KeuryRrUqXCrxtVWiJvv1FjNQRabDcyECLZ1rQ4728o',NULL,NULL,'2025-10-12 12:34:55.562',1,'2025-10-05 12:34:55.563','2025-10-05 12:34:55.562'),('c897cdae-cf0b-49a8-8b7d-52fdffa2a8ca','7566d1f0-4c85-4357-bede-738182673d47','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTY2ZDFmMC00Yzg1LTQzNTctYmVkZS03MzgxODI2NzNkNDciLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDM4NjYxLCJleHAiOjE3NTkwNDU4NjF9.mnW17ngJsVLgRgaqWumI-XyiC9V9GsZ-eipfUuepvzM',NULL,NULL,'2025-09-28 07:51:01.917',0,'2025-09-28 05:51:01.918','2025-09-28 05:51:01.917'),('cd69ad70-5c0d-46a8-8ce6-2ec81308dcf1','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTY2MjA3LCJleHAiOjE3NTk1NzM0MDd9.-byH4zZQ1cCG948z-Kq4TQpuSq6VV67qtHLNPuPia_s',NULL,NULL,'2025-10-11 08:23:27.580',0,'2025-10-04 08:23:27.582','2025-10-04 08:23:27.580'),('d0a94cbf-0fa3-49b2-84f9-a1df786d7c90','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NjQ0MTE2LCJleHAiOjE3NTg2NTEzMTZ9.2OWPv6q4EZ35Xlhvd31yzUXGF7so2Jc0_A_s3xTdVDk',NULL,NULL,'2025-09-23 18:15:16.183',0,'2025-09-23 16:15:16.184','2025-09-23 16:15:16.183'),('d37bd476-56ba-423f-bc5e-bd50f69c53fb','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzExMzM2LCJleHAiOjE3NTkzMTg1MzZ9.g2iEtQucRwb79LoFOTyieuBmtqUb9wzQdTRaoTnRFs4',NULL,NULL,'2025-10-01 11:35:36.074',0,'2025-10-01 09:35:36.076','2025-10-01 09:35:36.074'),('d44fabe9-2241-465e-a3bd-2e8d420580d4','7566d1f0-4c85-4357-bede-738182673d47','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NTY2ZDFmMC00Yzg1LTQzNTctYmVkZS03MzgxODI2NzNkNDciLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDM5MDM3LCJleHAiOjE3NTkwNDYyMzd9._DZrF1VJ4SzVRr5SZClIPWag6sAk9jHioD1QLp5-RX8',NULL,NULL,'2025-09-28 07:57:17.772',0,'2025-09-28 05:57:17.768','2025-09-28 05:57:17.772'),('d4a22c62-9b50-4621-a073-9295b891c3b6','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzMwMTYxLCJleHAiOjE3NTkzMzczNjF9.1ReYh9kRBIPMbPV8AThwo1CqqK24o2tYPVW9bhZfxSI',NULL,NULL,'2025-10-01 16:49:21.981',0,'2025-10-01 14:49:21.984','2025-10-01 14:49:21.982'),('d7a38307-50da-40d9-9487-1190286d60a5','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTU5MzMwLCJleHAiOjE3NTk1NjY1MzB9.8Yb_mQ2GvIFxn8grqtrQAfvRAbywmfjFdVCtPduGaZk',NULL,NULL,'2025-10-11 06:28:50.234',0,'2025-10-04 06:28:50.234','2025-10-04 06:28:50.234'),('d8427d75-3e3d-4645-ab14-9aea6269be1e','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjY0ODUyLCJleHAiOjE3NTk2NzIwNTJ9.Ctgl_iY7SMQ_VjJDefaiaVK40zbX524c68LkDHMDS5k',NULL,NULL,'2025-10-12 11:47:32.076',1,'2025-10-05 11:47:32.078','2025-10-05 11:47:32.076'),('dd7c2e65-cfe7-421d-b718-d838b851a2fe','4615a45b-9ac6-4259-a660-8f6a9209970d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjE1YTQ1Yi05YWM2LTQyNTktYTY2MC04ZjZhOTIwOTk3MGQiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDM5MzM2LCJleHAiOjE3NTkwNDY1MzZ9.XpqtMhJWIWy1Yl-U05YM6gljl6h0tXtXyLGgx2KSwKs',NULL,NULL,'2025-09-28 08:02:16.593',0,'2025-09-28 06:02:16.591','2025-09-28 06:02:16.593'),('de21e028-b211-4246-8362-e707b0617c96','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjY0NTUyLCJleHAiOjE3NTk2NzE3NTJ9.ntQqa3K8OYEmzKiv8gfoMINKJ2X27Aq9qehAf5Hofz4',NULL,NULL,'2025-10-12 11:42:32.191',1,'2025-10-05 11:42:32.193','2025-10-05 11:42:32.191'),('de227649-f9aa-4a45-9a96-2a821614b2ab','4615a45b-9ac6-4259-a660-8f6a9209970d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjE1YTQ1Yi05YWM2LTQyNTktYTY2MC04ZjZhOTIwOTk3MGQiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDM5NzUxLCJleHAiOjE3NTkwNDY5NTF9.S39KFX3Gy8e6xLUMBvFFWVXPB_nlfRZOK5zN39HDfZs',NULL,NULL,'2025-09-28 08:09:11.309',0,'2025-09-28 06:09:11.308','2025-09-28 06:09:11.309'),('e3370739-b703-4f4d-93cf-3966ec8cbd9c','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjU3MjM2LCJleHAiOjE3NTk2NjQ0MzZ9.UcKGcymOcUoPkBCfkxYLEvvPODftvimRDZ6G41uXMRc',NULL,NULL,'2025-10-12 09:40:36.994',1,'2025-10-05 09:40:36.995','2025-10-05 09:40:36.994'),('e40cb58b-3906-4a0b-9c0f-2cc337474638','0ca8e031-2298-4443-9b3f-8fbe3ec6cd31','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwY2E4ZTAzMS0yMjk4LTQ0NDMtOWIzZi04ZmJlM2VjNmNkMzEiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4OTk0MjIwLCJleHAiOjE3NTkwMDE0MjB9.TX5wFB7Ac8ozPtt8HsghMVISklUgKbKG3JCOfDJ1NDA',NULL,NULL,'2025-09-27 19:30:20.099',0,'2025-09-27 17:30:20.101','2025-09-27 17:30:20.099'),('e6d4684c-809d-45d3-9d56-9bc200626ea4','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NjQzMzA0LCJleHAiOjE3NTg2NTA1MDR9.vMbstnX0cEK4RAmlatvRDdJUUC2ugYb4bkuMG6sR3DU',NULL,NULL,'2025-09-23 18:01:44.561',0,'2025-09-23 16:01:44.564','2025-09-23 16:01:44.562'),('e70e3ce4-09fa-4080-bae2-b07c3a38d6c7','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NjAzMjk1LCJleHAiOjE3NTk2MTA0OTV9.XiLhEYoD6QcYM_Ig7SdzWvMQlKyccm6zsBLd0kY5NGg',NULL,NULL,'2025-10-11 18:41:35.619',1,'2025-10-04 18:41:35.620','2025-10-04 18:41:35.619'),('e75bd5c6-3f0c-4283-8964-45270a5b9583','93db1c98-1820-4743-8c9c-f2212f6dcb00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2RiMWM5OC0xODIwLTQ3NDMtOGM5Yy1mMjIxMmY2ZGNiMDAiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MzM0NTAwLCJleHAiOjE3NTkzNDE3MDB9.NdrEBfYR3rmZdAH8Tz8S63FX84INIhUuUfmi6oAZU6c',NULL,NULL,'2025-10-01 18:01:40.295',0,'2025-10-01 16:01:40.298','2025-10-01 16:01:40.295'),('e957e0dc-ebe2-42be-9a3a-298df25bd7d4','3d58c965-00f0-4919-bc4d-36d5314fe67f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZDU4Yzk2NS0wMGYwLTQ5MTktYmM0ZC0zNmQ1MzE0ZmU2N2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NTU4OTQ0LCJleHAiOjE3NTk1NjYxNDR9.u0Ta5p1LXlF_PanA_6RhUodnVFYIFOyGEKJK26LKEJ4',NULL,NULL,'2025-10-11 06:22:24.686',0,'2025-10-04 06:22:24.683','2025-10-04 06:22:24.686'),('e9fdf7e0-3622-4452-a2cd-0a3894eb9a89','84079f20-ff49-4cef-a6f8-9a9bd52e6549','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDA3OWYyMC1mZjQ5LTRjZWYtYTZmOC05YTliZDUyZTY1NDkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDU5NjAxLCJleHAiOjE3NTkwNjY4MDF9.UpgvYwqMGGUWjfAi79hTIXKlRWiqRJbIwSWSVZn9noA',NULL,NULL,'2025-09-28 13:40:01.275',0,'2025-09-28 11:40:01.277','2025-09-28 11:40:01.275'),('f3fd8dad-bf57-43d7-9741-438f09dc0afa','fd9c978d-9e49-4ec6-a057-a951fc1d6a9b','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZDljOTc4ZC05ZTQ5LTRlYzYtYTA1Ny1hOTUxZmMxZDZhOWIiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDM4MTQ5LCJleHAiOjE3NTkwNDUzNDl9.Hv4BjngGrcxkS3Z0VDtwBDJ4pjVfuMOST2OpcCYnBjM',NULL,NULL,'2025-09-28 07:42:29.694',0,'2025-09-28 05:42:29.691','2025-09-28 05:42:29.695'),('fb2e8721-e13f-48c2-9cdf-a5f4587e323b','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDA2MjM5LCJleHAiOjE3NTk0MDY0MTl9.k4buu2bV5L8Ma57SxG3sFQZ_9qcwT1yFfjRjHjm2A-c',NULL,NULL,'2025-10-02 12:02:19.216',0,'2025-10-02 11:57:19.218','2025-10-02 11:57:19.216'),('fd0fad87-c430-4d58-b2fc-3bff0a7a4316','4615a45b-9ac6-4259-a660-8f6a9209970d','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NjE1YTQ1Yi05YWM2LTQyNTktYTY2MC04ZjZhOTIwOTk3MGQiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5MDM5NjcxLCJleHAiOjE3NTkwNDY4NzF9.Eg8IJRmQOiUqN4JFF9EcIq4roW3ePC7S2p-ciGBFI1g',NULL,NULL,'2025-09-28 08:07:51.316',0,'2025-09-28 06:07:51.318','2025-09-28 06:07:51.316'),('fe4868a7-d857-4de9-a7fe-eaea11bd48c3','0981e10a-c1f1-4988-8459-3fbefc0a591f','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTgxZTEwYS1jMWYxLTQ5ODgtODQ1OS0zZmJlZmMwYTU5MWYiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4OTk0NDIyLCJleHAiOjE3NTkwMDE2MjJ9.wMyOBR3x9xN1UrfgQg-VxY6paACQKb81HPW2WqKd6t0',NULL,NULL,'2025-09-27 19:33:42.381',0,'2025-09-27 17:33:42.383','2025-09-27 17:33:42.381'),('ff836d5e-7f2c-4f82-bfc6-262566746f83','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZGY5YzcyZC1jYzI3LTQ5NmYtOWU5Ny00NGFiNmYyZDY1Y2YiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU4NTYyNTA4LCJleHAiOjE3NTg1Njk3MDh9.E6aKkNeE47UcXdItMFIu5a95btgtN1gx4nNWZUN9_hU',NULL,NULL,'2025-09-22 19:35:08.980',0,'2025-09-22 17:35:08.981','2025-09-22 17:35:08.980');
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `planId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','CANCELED','EXPIRED','PAST_DUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `startsAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endsAt` datetime(3) DEFAULT NULL,
  `canceledAt` datetime(3) DEFAULT NULL,
  `autoRenews` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `providerCustomerId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `providerSubscriptionId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Subscription_userId_idx` (`userId`),
  KEY `Subscription_planId_idx` (`planId`),
  KEY `Subscription_status_idx` (`status`),
  CONSTRAINT `subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscriptionplan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
INSERT INTO `subscription` VALUES ('cmgcf26xk00010mcsv98bvx1t','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmgccr6ow00020m40zs1wa4kw','CANCELED','2025-09-04 15:16:58.091','2025-09-06 18:30:00.000',NULL,1,'2025-10-04 15:16:58.091','2025-10-04 16:10:12.988',NULL,NULL,NULL,NULL),('cmgcgyo4i00010mc4a65bo7uc','2df9c72d-cc27-496f-9e97-44ab6f2d65cf','cmgccr6ow00020m40zs1wa4kw','ACTIVE','2025-10-04 16:10:12.988','2025-10-04 00:00:00.000',NULL,1,'2025-10-04 16:10:12.988','2025-10-05 04:46:40.664',NULL,NULL,NULL,NULL),('cmgch1cvf00030mc4mmmi6zbv','84079f20-ff49-4cef-a6f8-9a9bd52e6549','cmgccmu2w00010m40voxmjpsh','CANCELED','2025-10-01 16:12:18.402','2025-10-02 18:30:00.000',NULL,1,'2025-10-04 16:12:18.402','2025-10-04 16:15:56.389',NULL,NULL,NULL,NULL),('cmgch612t00070mc4gv8wzluz','84079f20-ff49-4cef-a6f8-9a9bd52e6549','cmgccr6ow00020m40zs1wa4kw','ACTIVE','2025-10-01 16:15:56.389','2025-10-02 18:30:00.000',NULL,1,'2025-10-04 16:15:56.389','2025-10-04 16:15:56.389',NULL,NULL,NULL,NULL),('cmgcihvsl00010mko9dxydsl9','3d58c965-00f0-4919-bc4d-36d5314fe67f','cmgchp7e200080mc4k9gu0kzy','ACTIVE','2025-10-04 16:53:08.998','2025-11-10 00:00:00.000',NULL,1,'2025-10-04 16:53:08.998','2025-10-04 17:51:57.694',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptionplan`
--

DROP TABLE IF EXISTS `subscriptionplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptionplan` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `audience` enum('COLLEGE','EXPERT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `billingPeriod` enum('MONTHLY','QUARTERLY','SEMIANNUAL','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priceCents` int NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `maxRequirements` int DEFAULT NULL,
  `maxExpertContacts` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `durationDays` int NOT NULL DEFAULT '30',
  `planType` enum('FREE','PAID') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  PRIMARY KEY (`id`),
  KEY `SubscriptionPlan_audience_idx` (`audience`),
  KEY `SubscriptionPlan_isActive_idx` (`isActive`),
  KEY `SubscriptionPlan_planType_idx` (`planType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptionplan`
--

LOCK TABLES `subscriptionplan` WRITE;
/*!40000 ALTER TABLE `subscriptionplan` DISABLE KEYS */;
INSERT INTO `subscriptionplan` VALUES ('cmgccmu2w00010m40voxmjpsh','Basic',NULL,'COLLEGE','MONTHLY',0,'INR',NULL,NULL,1,'2025-10-04 14:09:02.406','2025-10-04 14:09:02.406',30,'FREE'),('cmgccr6ow00020m40zs1wa4kw','Premium',NULL,'COLLEGE','MONTHLY',49900,'INR',NULL,NULL,1,'2025-10-04 14:12:25.374','2025-10-04 14:12:25.374',30,'PAID'),('cmgchp7e200080mc4k9gu0kzy','Basic',NULL,'EXPERT','MONTHLY',0,'INR',NULL,NULL,1,'2025-10-04 16:30:51.042','2025-10-04 16:30:51.042',30,'FREE'),('cmgchpvp100090mc4oi2gbmvw','Premium',NULL,'EXPERT','MONTHLY',14900,'INR',NULL,NULL,1,'2025-10-04 16:31:22.547','2025-10-04 16:31:22.547',30,'PAID');
/*!40000 ALTER TABLE `subscriptionplan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptionusage`
--

DROP TABLE IF EXISTS `subscriptionusage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptionusage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscriptionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periodStart` datetime(3) NOT NULL,
  `periodEnd` datetime(3) NOT NULL,
  `usedRequirements` int NOT NULL DEFAULT '0',
  `usedExpertContacts` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revealedExpertIds` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SubscriptionUsage_unique_period` (`subscriptionId`,`periodStart`,`periodEnd`),
  KEY `SubscriptionUsage_subscriptionId_idx` (`subscriptionId`),
  CONSTRAINT `subscriptionusage_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscription` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptionusage`
--

LOCK TABLES `subscriptionusage` WRITE;
/*!40000 ALTER TABLE `subscriptionusage` DISABLE KEYS */;
INSERT INTO `subscriptionusage` VALUES ('cmgch29lp00050mc49owazhkr','cmgch1cvf00030mc4mmmi6zbv','2025-09-30 18:30:00.000','2025-10-31 18:30:00.000',0,5,'2025-10-04 16:13:00.827','2025-10-04 16:13:00.827',NULL),('cmgclh55d00030mmwax2a4zwe','cmgcgyo4i00010mc4a65bo7uc','2025-09-30 18:30:00.000','2025-10-31 18:30:00.000',1,0,'2025-10-04 18:16:33.361','2025-10-04 18:16:33.361',NULL);
/*!40000 ALTER TABLE `subscriptionusage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isPhoneVerified` tinyint(1) NOT NULL DEFAULT '0',
  `emailVerifiedAt` datetime(3) DEFAULT NULL,
  `phoneVerifiedAt` datetime(3) DEFAULT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `role` enum('USER','EXPERT','COLLEGE_ADMIN','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `profileImage` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'UTC',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_phone_key` (`phone`),
  KEY `User_createdAt_idx` (`createdAt`),
  KEY `User_email_idx` (`email`),
  KEY `User_isActive_idx` (`isActive`),
  KEY `User_phone_idx` (`phone`),
  KEY `User_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('0981e10a-c1f1-4988-8459-3fbefc0a591f','test@gmail.com','2222222221','$2a$12$XkJYnKxFq3xa5x11WmvvYekyO3wHLqo9eDYK4qdHPoWdLxiEGLOiq','ESwar',0,0,NULL,NULL,'2025-09-27 17:33:42.342',1,0,'COLLEGE_ADMIN',NULL,'UTC','en','2025-09-27 17:33:16.320','2025-09-27 17:33:16.318',NULL),('0ca8e031-2298-4443-9b3f-8fbe3ec6cd31','sam@gmail.com',NULL,'$2a$12$CVfsKXLAl5KSSHoLFHvTjOUFTWoSfACzK/UNFAmmxjzX.JRRyfuMy','Sam',0,0,NULL,NULL,'2025-09-27 17:30:20.056',1,0,'COLLEGE_ADMIN',NULL,'UTC','en','2025-09-27 17:29:48.380','2025-09-27 17:29:48.377',NULL),('1251518b-d407-4c6c-8431-df04fca85fd0','harsha123@gmail.com','7702113875','$2a$12$jyKn4dl/ro9.rWUC2rfEneosdnEI.xHFodxvLToeIpnaL/Xy6mYU2','Test',0,0,NULL,NULL,NULL,1,0,'EXPERT',NULL,'UTC','en','2025-10-04 06:21:36.391','2025-10-04 06:21:36.387',NULL),('13adcfc8-f2ae-481d-bbea-4f51f94b20e8','mahesh@gmail.com','+917702112876','$2a$12$ectJna8vv.Lmm6CsVHCcaeatCVB/Hlf8748fswLVSPtFCfOVQKLCC','Mahesh',0,0,NULL,NULL,NULL,1,0,'EXPERT',NULL,'UTC','en','2025-09-28 05:29:04.290','2025-09-28 05:29:04.298',NULL),('237162ea-f15e-47d9-91e0-baf6ccc026cf','ramesh@gmail.com','+917702112874','$2a$12$uEHKSCf9kMPgrYcV89r2N.HyNQ4.t0OAtNvV2O1Nd7c5a./ivPM0G','Ramesh',0,0,NULL,NULL,'2025-09-27 17:32:25.567',1,0,'EXPERT',NULL,'UTC','en','2025-09-27 17:32:16.587','2025-09-27 17:32:16.584',NULL),('2df9c72d-cc27-496f-9e97-44ab6f2d65cf','jerry@gmail.com','+91770221111123','$2a$12$p5b9kfc5ywM2UGHWerBtl.kZr5Uxu0555KIIK7jh2Rc7jAbz87Xni','Jerry',1,0,NULL,NULL,'2025-10-05 12:34:55.442',1,0,'COLLEGE_ADMIN',NULL,'UTC','en','2025-09-22 17:35:03.332','2025-09-22 17:35:03.331',NULL),('37d6b548-215b-4459-b91b-11633a2b84ad','mahesh123@gmail.com','+91770211287','$2a$12$IB3op8ZtHreZ4OhKrasdR.vN9JIE3hS3Hzzb122cJYfY8ubuifyHW','Kamal',0,0,NULL,NULL,NULL,1,0,'EXPERT',NULL,'UTC','en','2025-09-28 05:35:02.313','2025-09-28 05:35:02.314',NULL),('3d58c965-00f0-4919-bc4d-36d5314fe67f','harsha@gmail.com','+917702112875','$2a$12$9IT3DtoywrRrOss48HUEXO1nenwEWzLIkKPykamS8S.JOLpMQmKVq','Harsha',1,0,NULL,NULL,'2025-10-05 10:36:13.070',1,0,'EXPERT',NULL,'UTC','en','2025-09-22 17:26:19.972','2025-09-22 17:26:19.970',NULL),('4615a45b-9ac6-4259-a660-8f6a9209970d','ma@gmail.com','+91770211282','$2a$12$X0qPUS4Ns4GaDpsn/U/pVOF81CZuk6OU.cpq2NRuFE1AKR3/KXdc2','Madhu',1,0,'2025-09-28 06:13:39.742',NULL,'2025-09-28 06:09:11.260',1,0,'EXPERT',NULL,'UTC','en','2025-09-28 06:01:48.988','2025-09-28 06:01:48.986',NULL),('54f3a261-9dd1-4a70-ad85-78f9395af57e','karthik@gmail.com',NULL,'$2a$12$YCs2n5lvWCTrDjtG7WK22OisprKKsTpVz6V0SFkCTe7Xqd87GTvRO','Madhu',0,0,NULL,NULL,'2025-09-27 17:25:23.099',1,0,'COLLEGE_ADMIN',NULL,'UTC','en','2025-09-27 17:25:11.861','2025-09-27 17:25:11.856',NULL),('7566d1f0-4c85-4357-bede-738182673d47','sam123@gmail.com','2222222222','$2a$12$CzXTLhMQtnU8cFlEJHXwMOFRg2hGrcS2OWeo2QRxzQ4zIbWAINiUe','Sam',1,0,'2025-09-28 05:53:05.960',NULL,'2025-09-28 05:57:17.742',1,0,'COLLEGE_ADMIN',NULL,'UTC','en','2025-09-28 05:44:58.238','2025-09-28 05:44:58.244',NULL),('84079f20-ff49-4cef-a6f8-9a9bd52e6549','mat@gmail.com','44456677777','$2a$12$MCBX9niU8sBLD4/LrLW4wODfhCHyYVWhywnURH29jvpoeSdR32PI6','test',1,0,'2025-09-28 06:21:33.630',NULL,'2025-10-04 16:02:25.732',1,0,'COLLEGE_ADMIN',NULL,'UTC','en','2025-09-28 06:16:02.476','2025-09-28 06:16:02.477',NULL),('93db1c98-1820-4743-8c9c-f2212f6dcb00','admin@gmail.com','+9111119797979','$2a$12$SZhCve3.YbDYmGjL8gpxOO4sTuuIOTrSfsxGT5qyQn7q3JzhEMYC6','Admin',1,0,NULL,NULL,'2025-10-05 04:49:22.613',1,0,'SUPER_ADMIN',NULL,'UTC','en','2025-09-22 17:29:29.003','2025-09-22 17:29:29.002',NULL),('fd9c978d-9e49-4ec6-a057-a951fc1d6a9b','jason@gmail.com','7702112872','$2a$12$06VAfoUj3sRjzMybrnMWAeONLrJ9.zo8.bFp5ik3JBlFC7z/VPH4a','jason',1,0,'2025-09-28 05:42:23.833',NULL,'2025-09-28 05:42:29.619',1,0,'EXPERT',NULL,'UTC','en','2025-09-28 05:41:53.504','2025-09-28 05:41:53.502',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workexperience`
--

DROP TABLE IF EXISTS `workexperience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workexperience` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expertProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobTitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `isCurrent` tinyint(1) NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `skills` json DEFAULT NULL,
  `achievements` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `WorkExperience_expertProfileId_idx` (`expertProfileId`),
  KEY `WorkExperience_startDate_idx` (`startDate`),
  KEY `WorkExperience_isCurrent_idx` (`isCurrent`),
  CONSTRAINT `WorkExperience_expertProfileId_fkey` FOREIGN KEY (`expertProfileId`) REFERENCES `expertprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workexperience`
--

LOCK TABLES `workexperience` WRITE;
/*!40000 ALTER TABLE `workexperience` DISABLE KEYS */;
INSERT INTO `workexperience` VALUES ('5c718fca-27f9-455b-8aa7-cda27a9fe019','ecd8e323-62e8-497d-9fe6-1b362435f12e','SE','Google','Chennai','2025-10-08 00:00:00.000',NULL,1,'Test','[\"React\", \"java\"]','test','2025-10-04 06:24:14.471','2025-10-04 06:24:14.466');
/*!40000 ALTER TABLE `workexperience` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-11 10:32:33
