-- MySQL dump 10.13  Distrib 5.7.24, for Linux (x86_64)
--
-- Host: localhost    Database: kukena
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `officials`
--

DROP TABLE IF EXISTS `officials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `officials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` text NOT NULL,
  `role` enum('admin','clerk') NOT NULL,
  `town_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `town_id` (`town_id`),
  CONSTRAINT `officials_ibfk_1` FOREIGN KEY (`town_id`) REFERENCES `towns` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `officials`
--

LOCK TABLES `officials` WRITE;
/*!40000 ALTER TABLE `officials` DISABLE KEYS */;
INSERT INTO `officials` VALUES (1,'commcomm','commcomm@gmail.com','scrypt:32768:8:1$by8FuCvscfAqr2pQ$3c37627678babf4ee70f24c270363adac54c1d264a2557361449f3efe030528d941ffa5ce78bf240c331301cb4d263bf92b3f5e3eb370843beb849089ba00182','admin',1,'2025-04-29 13:55:40'),(4,'Alexander Maina','amnjogu78@gmail.com','scrypt:32768:8:1$JktZ9NaXkLo0bvpP$c47df0ef552fb5cb3a1cc6123aff9b453b16e54e45ff6286c58b5d6444911a0082edb057cb8f3a36dcb93e7c60c427ec7897fd3ace173b0f38f8c755358c0967','admin',1,'2025-05-17 16:58:09');
/*!40000 ALTER TABLE `officials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcel_movements`
--

DROP TABLE IF EXISTS `parcel_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcel_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parcel_tracking_number` varchar(6) NOT NULL,
  `from_town_id` int(11) NOT NULL,
  `to_town_id` int(11) NOT NULL,
  `handled_by` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `timestamp` datetime DEFAULT NULL,
  `status` enum('dispatched','arrived') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parcel_tracking_number` (`parcel_tracking_number`),
  KEY `from_town_id` (`from_town_id`),
  KEY `to_town_id` (`to_town_id`),
  KEY `handled_by` (`handled_by`),
  KEY `vehicle_id` (`vehicle_id`),
  CONSTRAINT `parcel_movements_ibfk_1` FOREIGN KEY (`parcel_tracking_number`) REFERENCES `parcels` (`tracking_number`),
  CONSTRAINT `parcel_movements_ibfk_2` FOREIGN KEY (`from_town_id`) REFERENCES `towns` (`id`),
  CONSTRAINT `parcel_movements_ibfk_3` FOREIGN KEY (`to_town_id`) REFERENCES `towns` (`id`),
  CONSTRAINT `parcel_movements_ibfk_4` FOREIGN KEY (`handled_by`) REFERENCES `officials` (`id`),
  CONSTRAINT `parcel_movements_ibfk_5` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcel_movements`
--

LOCK TABLES `parcel_movements` WRITE;
/*!40000 ALTER TABLE `parcel_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `parcel_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcels`
--

DROP TABLE IF EXISTS `parcels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcels` (
  `tracking_number` varchar(6) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sender_phone` varchar(15) NOT NULL,
  `receiver_name` varchar(255) NOT NULL,
  `receiver_phone` varchar(15) NOT NULL,
  `origin_town_id` int(11) NOT NULL,
  `destination_town_id` int(11) NOT NULL,
  `weight_kg` float NOT NULL,
  `payment_method` enum('cash','mpesa','payment_on_delivery') NOT NULL,
  `status` enum('registered','in_transit','delivered') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`tracking_number`),
  KEY `origin_town_id` (`origin_town_id`),
  KEY `destination_town_id` (`destination_town_id`),
  CONSTRAINT `parcels_ibfk_1` FOREIGN KEY (`origin_town_id`) REFERENCES `towns` (`id`),
  CONSTRAINT `parcels_ibfk_2` FOREIGN KEY (`destination_town_id`) REFERENCES `towns` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcels`
--

LOCK TABLES `parcels` WRITE;
/*!40000 ALTER TABLE `parcels` DISABLE KEYS */;
INSERT INTO `parcels` VALUES ('4RHLYX','Comm comm','0756453312','Alexander Karl','0768444177',1,2,2,'cash','registered','2025-04-29 16:21:42');
/*!40000 ALTER TABLE `parcels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `towns`
--

DROP TABLE IF EXISTS `towns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `towns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `phone` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `towns`
--

LOCK TABLES `towns` WRITE;
/*!40000 ALTER TABLE `towns` DISABLE KEYS */;
INSERT INTO `towns` VALUES (1,'Nairobi','Imenti House Ground Floor Room number 12','0712345678'),(2,'Mwea','Friends hotels building ground floor rm no: 12','0723456788'),(3,'Embu','Mathai House,Ground floor, rm 33','0745342234');
/*!40000 ALTER TABLE `towns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `registration_number` varchar(20) NOT NULL,
  `driver_name` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_number` (`registration_number`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'KDP 087D','Karanja Muanga','0786543234');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-17 23:04:46
