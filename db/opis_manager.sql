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
-- Table structure for table `dipartimento`
--

DROP TABLE IF EXISTS `dipartimento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dipartimento` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unict_id` int(11) NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anno_accademico` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dipartimento_unict_id_anno_accademico_unique` (`unict_id`,`anno_accademico`)
) ENGINE=InnoDB AUTO_INCREMENT=966 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `corso_di_studi`
--

DROP TABLE IF EXISTS `corso_di_studi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `corso_di_studi` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `unict_id` varchar(255) NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `classe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anno_accademico` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_dipartimento` bigint(20) unsigned NOT NULL,
  `scostamento_numerosita` double(10,2) NOT NULL DEFAULT 50.00,
  `scostamento_media` double(10,2) NOT NULL DEFAULT 20.00,
  `pesi_domande` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pesi_domande`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `corso_di_studi_unict_id_anno_accademico_unique` (`unict_id`,`anno_accademico`),
  KEY `corso_di_studi_id_dipartimento_foreign` (`id_dipartimento`),
  CONSTRAINT `corso_di_studi_id_dipartimento_foreign` FOREIGN KEY (`id_dipartimento`) REFERENCES `dipartimento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4446 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `insegnamento`
--

DROP TABLE IF EXISTS `insegnamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `insegnamento` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `codice_gomp` int(11) NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anno_accademico` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `anno` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semestre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cfu` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `docente` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canale` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'no',
  `id_modulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `nome_modulo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(4) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ssd` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assegn` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_cds` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `insegnamento_id_cds_foreign` (`id_cds`),
  CONSTRAINT `insegnamento_id_cds_foreign` FOREIGN KEY (`id_cds`) REFERENCES `corso_di_studi` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=132852 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `schede_opis`
--

DROP TABLE IF EXISTS `schede_opis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schede_opis` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `anno_accademico` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `totale_schede` int(11) NOT NULL,
  `totale_schede_nf` int(11) NOT NULL,
  `femmine` int(11) DEFAULT NULL,
  `femmine_nf` int(11) DEFAULT NULL,
  `fc` int(11) NOT NULL,
  `inatt` int(11) DEFAULT NULL,
  `inatt_nf` int(11) NOT NULL,
  `eta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`eta`)),
  `anno_iscr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`anno_iscr`)),
  `num_studenti` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`num_studenti`)),
  `ragg_uni` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ragg_uni`)),
  `studio_gg` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`studio_gg`)),
  `studio_tot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`studio_tot`)),
  `domande` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`domande`)),
  `domande_nf` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`domande_nf`)),
  `motivo_nf` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`motivo_nf`)),
  `sugg` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sugg`)),
  `sugg_nf` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sugg_nf`)),
  `id_insegnamento` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `schede_opis_id_insegnamento_foreign` (`id_insegnamento`),
  CONSTRAINT `schede_opis_id_insegnamento_foreign` FOREIGN KEY (`id_insegnamento`) REFERENCES `insegnamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=107930 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
