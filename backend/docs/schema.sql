-- MySQL dump 10.19  Distrib 10.3.39-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: homeless
-- ------------------------------------------------------
-- Server version	10.3.39-MariaDB-1:10.3.39+maria~ubu2004

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Events` (
  `Id_Events` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `Quantity_For_events` int(11) NOT NULL,
  `Date_EV` date DEFAULT NULL,
  `Time_EV` time DEFAULT NULL,
  `id_status` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id_Events`),
  KEY `type_id` (`type_id`),
  KEY `id_status` (`id_status`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `Type` (`Id`),
  CONSTRAINT `Events_ibfk_2` FOREIGN KEY (`id_status`) REFERENCES `Status_Event` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2911 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `NOTE_FOR_Events`
--

DROP TABLE IF EXISTS `NOTE_FOR_Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NOTE_FOR_Events` (
  `Id_Note_EVENTS` int(11) NOT NULL AUTO_INCREMENT,
  `Id_Events_FK` int(11) NOT NULL,
  `client_id_FK` int(11) DEFAULT NULL,
  `Comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visit_id` int(11) DEFAULT NULL,
  `FName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `LName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Who` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `WhoNUM` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id_Note_EVENTS`),
  KEY `Id_Events_FK` (`Id_Events_FK`),
  KEY `client_id_FK` (`client_id_FK`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `NOTE_FOR_Events_ibfk_1` FOREIGN KEY (`Id_Events_FK`) REFERENCES `Events` (`Id_Events`),
  CONSTRAINT `NOTE_FOR_Events_ibfk_3` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=16906 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Regular_Events`
--

DROP TABLE IF EXISTS `Regular_Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Regular_Events` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `Quantity_For_events` int(11) NOT NULL,
  `Id_Day` int(11) NOT NULL,
  `Time` time NOT NULL,
  `IsOnce` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `type_id` (`type_id`),
  KEY `Id_Day` (`Id_Day`),
  CONSTRAINT `Regular_Events_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `Type` (`Id`),
  CONSTRAINT `Regular_Events_ibfk_2` FOREIGN KEY (`Id_Day`) REFERENCES `WEEKDAYS` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Status_Event`
--

DROP TABLE IF EXISTS `Status_Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Status_Event` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Type`
--

DROP TABLE IF EXISTS `Type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Type` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imgname` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WEEKDAYS`
--

DROP TABLE IF EXISTS `WEEKDAYS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WEEKDAYS` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Day` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificate`
--

DROP TABLE IF EXISTS `certificate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_219CDA4A19EB6921` (`client_id`),
  KEY `IDX_219CDA4AC54C8C93` (`type_id`),
  KEY `IDX_219CDA4AC33F7837` (`document_id`),
  KEY `IDX_219CDA4AB03A8386` (`created_by_id`),
  KEY `IDX_219CDA4A896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_219CDA4A19EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_219CDA4A896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_219CDA4AB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_219CDA4AC33F7837` FOREIGN KEY (`document_id`) REFERENCES `document` (`id`),
  CONSTRAINT `FK_219CDA4AC54C8C93` FOREIGN KEY (`type_id`) REFERENCES `certificate_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `certificate_type`
--

DROP TABLE IF EXISTS `certificate_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificate_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `downloadable` tinyint(1) DEFAULT NULL,
  `show_photo` tinyint(1) DEFAULT NULL,
  `show_date` tinyint(1) DEFAULT NULL,
  `content_header_left` longtext DEFAULT NULL,
  `content_header_right` longtext DEFAULT NULL,
  `content_body_right` longtext DEFAULT NULL,
  `content_footer` longtext DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_F2C76A50B03A8386` (`created_by_id`),
  KEY `IDX_F2C76A50896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_F2C76A50896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_F2C76A50B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `last_residence_district_id` int(11) DEFAULT NULL,
  `last_registration_district_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `photo_name` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `birth_place` varchar(255) DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `is_homeless` int(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `IDX_C7440455E563C280` (`last_residence_district_id`),
  KEY `IDX_C744045560012056` (`last_registration_district_id`),
  KEY `IDX_C7440455B03A8386` (`created_by_id`),
  KEY `IDX_C7440455896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_C744045560012056` FOREIGN KEY (`last_registration_district_id`) REFERENCES `district` (`id`),
  CONSTRAINT `FK_C7440455896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_C7440455B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_C7440455E563C280` FOREIGN KEY (`last_residence_district_id`) REFERENCES `district` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1531 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_field`
--

DROP TABLE IF EXISTS `client_field`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_field` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `required` tinyint(1) DEFAULT NULL,
  `multiple` tinyint(1) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `mandatory_for_homeless` int(1) NOT NULL DEFAULT 0,
  `enabled_for_homeless` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `IDX_F898D9EFB03A8386` (`created_by_id`),
  KEY `IDX_F898D9EF896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_F898D9EF896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_F898D9EFB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_field_option`
--

DROP TABLE IF EXISTS `client_field_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_field_option` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `field_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `not_single` tinyint(1) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_C1C82EB3443707B0` (`field_id`),
  KEY `IDX_C1C82EB3B03A8386` (`created_by_id`),
  KEY `IDX_C1C82EB3896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_C1C82EB3443707B0` FOREIGN KEY (`field_id`) REFERENCES `client_field` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_C1C82EB3896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_C1C82EB3B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1104 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_field_value`
--

DROP TABLE IF EXISTS `client_field_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_field_value` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `field_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `option_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `datetime` datetime DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `value_unique` (`field_id`,`client_id`),
  KEY `IDX_379BEBF4443707B0` (`field_id`),
  KEY `IDX_379BEBF419EB6921` (`client_id`),
  KEY `IDX_379BEBF4A7C41D6F` (`option_id`),
  KEY `IDX_379BEBF4B03A8386` (`created_by_id`),
  KEY `IDX_379BEBF4896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_379BEBF419EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_379BEBF4443707B0` FOREIGN KEY (`field_id`) REFERENCES `client_field` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_379BEBF4896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_379BEBF4A7C41D6F` FOREIGN KEY (`option_id`) REFERENCES `client_field_option` (`id`),
  CONSTRAINT `FK_379BEBF4B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23656 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_field_value_client_field_option`
--

DROP TABLE IF EXISTS `client_field_value_client_field_option`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_field_value_client_field_option` (
  `client_field_value_id` int(11) NOT NULL,
  `client_field_option_id` int(11) NOT NULL,
  PRIMARY KEY (`client_field_value_id`,`client_field_option_id`),
  KEY `IDX_687F3075EDB7EE0` (`client_field_value_id`),
  KEY `IDX_687F30753FE1C616` (`client_field_option_id`),
  CONSTRAINT `FK_687F30753FE1C616` FOREIGN KEY (`client_field_option_id`) REFERENCES `client_field_option` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_687F3075EDB7EE0` FOREIGN KEY (`client_field_value_id`) REFERENCES `client_field_value` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contract`
--

DROP TABLE IF EXISTS `contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `document_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_E98F285919EB6921` (`client_id`),
  KEY `IDX_E98F28596BF700BD` (`status_id`),
  KEY `IDX_E98F2859C33F7837` (`document_id`),
  KEY `IDX_E98F2859B03A8386` (`created_by_id`),
  KEY `IDX_E98F2859896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_E98F285919EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_E98F28596BF700BD` FOREIGN KEY (`status_id`) REFERENCES `contract_status` (`id`),
  CONSTRAINT `FK_E98F2859896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_E98F2859B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_E98F2859C33F7837` FOREIGN KEY (`document_id`) REFERENCES `document` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contract_item`
--

DROP TABLE IF EXISTS `contract_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contract_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `date_start` date DEFAULT NULL,
  `date` date DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_776E6B762576E0FD` (`contract_id`),
  KEY `IDX_776E6B76C54C8C93` (`type_id`),
  KEY `IDX_776E6B76B03A8386` (`created_by_id`),
  KEY `IDX_776E6B76896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_776E6B762576E0FD` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`),
  CONSTRAINT `FK_776E6B76896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_776E6B76B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_776E6B76C54C8C93` FOREIGN KEY (`type_id`) REFERENCES `contract_item_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contract_item_type`
--

DROP TABLE IF EXISTS `contract_item_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract_item_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_69794B44B03A8386` (`created_by_id`),
  KEY `IDX_69794B44896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_69794B44896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_69794B44B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contract_status`
--

DROP TABLE IF EXISTS `contract_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_47408051B03A8386` (`created_by_id`),
  KEY `IDX_47408051896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_47408051896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_47408051B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `district`
--

DROP TABLE IF EXISTS `district`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `district` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `region_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_31C1548798260155` (`region_id`),
  KEY `IDX_31C15487B03A8386` (`created_by_id`),
  KEY `IDX_31C15487896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_31C15487896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_31C1548798260155` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`),
  CONSTRAINT `FK_31C15487B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `document`
--

DROP TABLE IF EXISTS `document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `number_prefix` varchar(255) DEFAULT NULL,
  `registration` int(11) DEFAULT NULL,
  `issued` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_D8698A7619EB6921` (`client_id`),
  KEY `IDX_D8698A76C54C8C93` (`type_id`),
  KEY `IDX_D8698A76B03A8386` (`created_by_id`),
  KEY `IDX_D8698A76896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_D8698A7619EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_D8698A76896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_D8698A76B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_D8698A76C54C8C93` FOREIGN KEY (`type_id`) REFERENCES `document_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `document_file`
--

DROP TABLE IF EXISTS `document_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_2B2BBA8319EB6921` (`client_id`),
  KEY `IDX_2B2BBA83C54C8C93` (`type_id`),
  KEY `IDX_2B2BBA83B03A8386` (`created_by_id`),
  KEY `IDX_2B2BBA83896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_2B2BBA8319EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_2B2BBA83896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_2B2BBA83B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_2B2BBA83C54C8C93` FOREIGN KEY (`type_id`) REFERENCES `document_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `document_type`
--

DROP TABLE IF EXISTS `document_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_2B6ADBBAB03A8386` (`created_by_id`),
  KEY `IDX_2B6ADBBA896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_2B6ADBBA896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_2B6ADBBAB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fos_user_group`
--

DROP TABLE IF EXISTS `fos_user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fos_user_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `roles` longtext NOT NULL COMMENT '(DC2Type:array)',
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_583D1F3E5E237E06` (`name`),
  KEY `IDX_583D1F3EB03A8386` (`created_by_id`),
  KEY `IDX_583D1F3E896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_583D1F3E896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_583D1F3EB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fos_user_user`
--

DROP TABLE IF EXISTS `fos_user_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fos_user_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `position_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `username_canonical` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_canonical` varchar(255) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `locked` tinyint(1) NOT NULL,
  `expired` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `confirmation_token` varchar(255) DEFAULT NULL,
  `password_requested_at` datetime DEFAULT NULL,
  `roles` longtext NOT NULL COMMENT '(DC2Type:array)',
  `credentials_expired` tinyint(1) NOT NULL,
  `credentials_expire_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `firstname` varchar(64) DEFAULT NULL,
  `lastname` varchar(64) DEFAULT NULL,
  `website` varchar(64) DEFAULT NULL,
  `biography` varchar(1000) DEFAULT NULL,
  `gender` varchar(1) DEFAULT NULL,
  `locale` varchar(8) DEFAULT NULL,
  `timezone` varchar(64) DEFAULT NULL,
  `phone` varchar(64) DEFAULT NULL,
  `facebook_uid` varchar(255) DEFAULT NULL,
  `facebook_name` varchar(255) DEFAULT NULL,
  `facebook_data` longtext DEFAULT NULL COMMENT '(DC2Type:json)',
  `twitter_uid` varchar(255) DEFAULT NULL,
  `twitter_name` varchar(255) DEFAULT NULL,
  `twitter_data` longtext DEFAULT NULL COMMENT '(DC2Type:json)',
  `gplus_uid` varchar(255) DEFAULT NULL,
  `gplus_name` varchar(255) DEFAULT NULL,
  `gplus_data` longtext DEFAULT NULL COMMENT '(DC2Type:json)',
  `token` varchar(255) DEFAULT NULL,
  `two_step_code` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `proxy_date` date DEFAULT NULL,
  `proxy_num` varchar(255) DEFAULT NULL,
  `passport` longtext DEFAULT NULL,
  `position_text` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_C560D76192FC23A8` (`username_canonical`),
  UNIQUE KEY `UNIQ_C560D761A0D96FBF` (`email_canonical`),
  KEY `IDX_C560D761DD842E46` (`position_id`),
  KEY `IDX_C560D761B03A8386` (`created_by_id`),
  KEY `IDX_C560D761896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_C560D761896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_C560D761B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_C560D761DD842E46` FOREIGN KEY (`position_id`) REFERENCES `position` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fos_user_user_group`
--

DROP TABLE IF EXISTS `fos_user_user_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fos_user_user_group` (
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `IDX_B3C77447A76ED395` (`user_id`),
  KEY `IDX_B3C77447FE54D947` (`group_id`),
  CONSTRAINT `FK_B3C77447A76ED395` FOREIGN KEY (`user_id`) REFERENCES `fos_user_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_B3C77447FE54D947` FOREIGN KEY (`group_id`) REFERENCES `fos_user_group` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generated_document`
--

DROP TABLE IF EXISTS `generated_document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_document` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `start_text_id` int(11) DEFAULT NULL,
  `end_text_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `whom` longtext DEFAULT NULL,
  `signature` longtext DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_98C8BDCF19EB6921` (`client_id`),
  KEY `IDX_98C8BDCFC54C8C93` (`type_id`),
  KEY `IDX_98C8BDCF9948699B` (`start_text_id`),
  KEY `IDX_98C8BDCFFC4264A1` (`end_text_id`),
  KEY `IDX_98C8BDCFB03A8386` (`created_by_id`),
  KEY `IDX_98C8BDCF896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_98C8BDCF19EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_98C8BDCF896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_98C8BDCF9948699B` FOREIGN KEY (`start_text_id`) REFERENCES `generated_document_start_text` (`id`),
  CONSTRAINT `FK_98C8BDCFB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_98C8BDCFC54C8C93` FOREIGN KEY (`type_id`) REFERENCES `generated_document_type` (`id`),
  CONSTRAINT `FK_98C8BDCFFC4264A1` FOREIGN KEY (`end_text_id`) REFERENCES `generated_document_end_text` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generated_document_end_text`
--

DROP TABLE IF EXISTS `generated_document_end_text`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_document_end_text` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_1FC324CEB03A8386` (`created_by_id`),
  KEY `IDX_1FC324CE896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_1FC324CE896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_1FC324CEB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generated_document_start_text`
--

DROP TABLE IF EXISTS `generated_document_start_text`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_document_start_text` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_D15AEC56B03A8386` (`created_by_id`),
  KEY `IDX_D15AEC56896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_D15AEC56896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_D15AEC56B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generated_document_type`
--

DROP TABLE IF EXISTS `generated_document_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_document_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_73820995B03A8386` (`created_by_id`),
  KEY `IDX_73820995896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_73820995896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_73820995B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_27BA704B19EB6921` (`client_id`),
  KEY `IDX_27BA704BB03A8386` (`created_by_id`),
  KEY `IDX_27BA704B896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_27BA704B19EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_27BA704B896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_27BA704BB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `history_download`
--

DROP TABLE IF EXISTS `history_download`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history_download` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `certificate_type_id` int(11) DEFAULT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_38E1EE3A19EB6921` (`client_id`),
  KEY `IDX_38E1EE3AA76ED395` (`user_id`),
  KEY `IDX_38E1EE3A90EF3F4C` (`certificate_type_id`),
  CONSTRAINT `FK_38E1EE3A19EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_38E1EE3A90EF3F4C` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_type` (`id`),
  CONSTRAINT `FK_38E1EE3AA76ED395` FOREIGN KEY (`user_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `menu_item`
--

DROP TABLE IF EXISTS `menu_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `menu_item` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_D754D55077153098` (`code`),
  KEY `IDX_D754D550B03A8386` (`created_by_id`),
  KEY `IDX_D754D550896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_D754D550896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_D754D550B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migration_versions`
--

DROP TABLE IF EXISTS `migration_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migration_versions` (
  `version` varchar(255) NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `note`
--

DROP TABLE IF EXISTS `note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `note` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `important` tinyint(1) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_CFBDFA1419EB6921` (`client_id`),
  KEY `IDX_CFBDFA14B03A8386` (`created_by_id`),
  KEY `IDX_CFBDFA14896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_CFBDFA1419EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_CFBDFA14896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_CFBDFA14B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notice`
--

DROP TABLE IF EXISTS `notice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `text` longtext DEFAULT NULL,
  `date` date DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_480D45C219EB6921` (`client_id`),
  KEY `IDX_480D45C2B03A8386` (`created_by_id`),
  KEY `IDX_480D45C2896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_480D45C219EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_480D45C2896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_480D45C2B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notice_user`
--

DROP TABLE IF EXISTS `notice_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notice_user` (
  `user_id` int(11) NOT NULL,
  `notice_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`notice_id`),
  UNIQUE KEY `UNIQ_DFD1E3B87D540AB` (`notice_id`),
  KEY `IDX_DFD1E3B8A76ED395` (`user_id`),
  CONSTRAINT `FK_DFD1E3B87D540AB` FOREIGN KEY (`notice_id`) REFERENCES `notice` (`id`),
  CONSTRAINT `FK_DFD1E3B8A76ED395` FOREIGN KEY (`user_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `position`
--

DROP TABLE IF EXISTS `position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `position` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_462CE4F5B03A8386` (`created_by_id`),
  KEY `IDX_462CE4F5896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_462CE4F5896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_462CE4F5B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `region`
--

DROP TABLE IF EXISTS `region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `region` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `short_name` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_F62F176B03A8386` (`created_by_id`),
  KEY `IDX_F62F176896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_F62F176896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_F62F176B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resident_questionnaire`
--

DROP TABLE IF EXISTS `resident_questionnaire`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resident_questionnaire` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `is_dwelling` int(1) DEFAULT NULL,
  `room_type_id` int(11) DEFAULT NULL,
  `is_work` int(1) DEFAULT NULL,
  `is_work_official` int(1) DEFAULT NULL,
  `is_work_constant` int(1) DEFAULT NULL,
  `changed_jobs_count_id` int(11) DEFAULT NULL,
  `reason_for_transition_ids` varchar(64) DEFAULT NULL,
  `reason_for_petition_ids` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `resident_questionnaire_client_id_fk` (`client_id`),
  CONSTRAINT `resident_questionnaire_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_E19D9AD219EB6921` (`client_id`),
  KEY `IDX_E19D9AD2C54C8C93` (`type_id`),
  KEY `IDX_E19D9AD2B03A8386` (`created_by_id`),
  KEY `IDX_E19D9AD2896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_E19D9AD219EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_E19D9AD2896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_E19D9AD2B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_E19D9AD2C54C8C93` FOREIGN KEY (`type_id`) REFERENCES `service_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26349 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service_type`
--

DROP TABLE IF EXISTS `service_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `service_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `pay` tinyint(1) DEFAULT NULL,
  `document` tinyint(1) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_429DE3C5B03A8386` (`created_by_id`),
  KEY `IDX_429DE3C5896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_429DE3C5896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_429DE3C5B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shelter_history`
--

DROP TABLE IF EXISTS `shelter_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shelter_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `contract_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `diphtheria_vaccination_date` date DEFAULT NULL,
  `fluorography_date` date DEFAULT NULL,
  `hepatitis_vaccination_date` date DEFAULT NULL,
  `typhus_vaccination_date` date DEFAULT NULL,
  `date_from` date DEFAULT NULL,
  `date_to` date DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_D04221A054177093` (`room_id`),
  KEY `IDX_D04221A019EB6921` (`client_id`),
  KEY `IDX_D04221A06BF700BD` (`status_id`),
  KEY `IDX_D04221A02576E0FD` (`contract_id`),
  KEY `IDX_D04221A0B03A8386` (`created_by_id`),
  KEY `IDX_D04221A0896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_D04221A019EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_D04221A02576E0FD` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`),
  CONSTRAINT `FK_D04221A054177093` FOREIGN KEY (`room_id`) REFERENCES `shelter_room` (`id`),
  CONSTRAINT `FK_D04221A06BF700BD` FOREIGN KEY (`status_id`) REFERENCES `shelter_status` (`id`),
  CONSTRAINT `FK_D04221A0896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_D04221A0B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shelter_room`
--

DROP TABLE IF EXISTS `shelter_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shelter_room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `max_occupants` int(11) DEFAULT NULL,
  `current_occupants` int(11) DEFAULT NULL,
  `comment` longtext DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_1169D9EDB03A8386` (`created_by_id`),
  KEY `IDX_1169D9ED896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_1169D9ED896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_1169D9EDB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shelter_status`
--

DROP TABLE IF EXISTS `shelter_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shelter_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_E106D388B03A8386` (`created_by_id`),
  KEY `IDX_E106D388896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_E106D388896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_E106D388B03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `viewed_client`
--

DROP TABLE IF EXISTS `viewed_client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `viewed_client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `updated_by_id` int(11) DEFAULT NULL,
  `sync_id` int(11) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_74C641DB19EB6921` (`client_id`),
  KEY `IDX_74C641DBB03A8386` (`created_by_id`),
  KEY `IDX_74C641DB896DBBDE` (`updated_by_id`),
  CONSTRAINT `FK_74C641DB19EB6921` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  CONSTRAINT `FK_74C641DB896DBBDE` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`),
  CONSTRAINT `FK_74C641DBB03A8386` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17630 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visit`
--

DROP TABLE IF EXISTS `visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visit` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `visit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-06  5:23:14
