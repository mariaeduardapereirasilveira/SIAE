-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_siae
-- ------------------------------------------------------
-- Server version	8.2.0

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
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'INFO 1A'),(2,'INFO 2A');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faq_category_id` int NOT NULL,
  `question` mediumtext NOT NULL,
  `answer` mediumtext NOT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Faqs_Faqs_categories1_idx` (`faq_category_id`),
  CONSTRAINT `fk_Faqs_Faqs_categories1` FOREIGN KEY (`faq_category_id`) REFERENCES `faqs_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,1,'Quem pode acessar o SIAE?','O acesso ao SIAE é destinado aos administradores e profissionais autorizados. Estudantes não possuem acesso direto ao sistema.',1),(2,1,'Como faço login no SIAE?','Para acessar o sistema, informe suas credenciais de acesso e selecione o perfil correspondente à sua função, quando solicitado.',1),(3,1,'O que fazer quando não consigo acessar minha conta?','Verifique se suas credenciais foram digitadas corretamente. Caso o problema continue, entre em contato com o administrador do sistema.',1),(4,2,'Quem pode cadastrar usuários no SIAE?','O cadastro de usuários é realizado por pessoas que possuem autorização administrativa para essa atividade.',1),(5,2,'Quais informações são armazenadas no cadastro de um usuário?','O cadastro pode conter informações de identificação, contato, vínculo institucional e dados necessários à utilização do sistema.',1),(6,2,'Posso alterar as informações de um usuário?','As alterações devem ser realizadas por usuários autorizados, respeitando as permissões atribuídas a cada perfil.',1),(7,3,'O que é uma ocorrência no SIAE?','Uma ocorrência é um registro de uma situação relacionada a um estudante que necessita de acompanhamento ou encaminhamento pelos profissionais responsáveis.',1),(8,3,'Como funciona o nível de sigilo de uma ocorrência?','O nível de sigilo determina quais entidades podem ter acesso às informações da ocorrência, conforme a classificação definida no registro.',1),(9,3,'Quais são os status de uma ocorrência?','Uma ocorrência pode estar como ativa, interrompida ou encerrada, indicando sua situação atual no processo de acompanhamento.',1),(10,4,'O que é um serviço no SIAE?','Um serviço representa um registro relacionado ao atendimento ou acompanhamento de um estudante por um profissional.',1),(11,4,'O que é um tratamento?','Um tratamento reúne informações e ações relacionadas ao acompanhamento de uma ocorrência.',1),(12,4,'É possível vincular mais de um serviço a um tratamento?','Sim. Um tratamento pode estar relacionado a diferentes serviços, permitindo reunir as ações envolvidas no acompanhamento.',1),(13,5,'Para que servem os relatórios?','Os relatórios permitem registrar informações relevantes sobre os atendimentos e acompanhamentos realizados pelos profissionais.',1),(14,5,'Quem pode editar um relatório?','A edição de um relatório deve respeitar as regras de autoria e permissão do sistema. Em regra, somente seu criador pode editá-lo.',1),(15,5,'Um relatório pode ser associado a mais de um tratamento?','Sim. O sistema permite relacionar relatórios a tratamentos, mantendo o histórico dessas associações.',1),(16,6,'Para que servem as notificações?','As notificações informam o usuário sobre acontecimentos e atividades relevantes dentro do SIAE.',1),(17,6,'Como sei se uma notificação já foi lida?','O sistema utiliza um indicador de leitura para diferenciar notificações lidas das que ainda não foram visualizadas.',1),(18,6,'As notificações podem ser desativadas?','A disponibilidade dessa opção depende das funcionalidades e permissões implementadas no sistema.',1),(19,7,'Todos os profissionais podem visualizar todas as ocorrências?','Não necessariamente. O acesso depende do nível de sigilo, das entidades envolvidas e das permissões atribuídas ao profissional.',1),(20,7,'O compartilhamento de uma ocorrência libera automaticamente seus relatórios?','Não. O compartilhamento de uma ocorrência não concede automaticamente acesso irrestrito aos relatórios associados. As permissões dos relatórios são controladas separadamente.',1),(21,7,'Por que algumas informações não aparecem para determinados usuários?','Algumas informações são restritas para proteger a privacidade dos estudantes e garantir que somente pessoas autorizadas tenham acesso aos registros.',1),(22,8,'Qual é a finalidade do SIAE?','O SIAE tem como finalidade auxiliar no registro, organização e acompanhamento de informações relacionadas aos serviços de apoio e atendimento oferecidos pela instituição.',1),(23,8,'Quem é responsável pelas informações registradas no sistema?','Os profissionais e administradores autorizados são responsáveis pelos registros que realizam, devendo observar as regras institucionais e de confidencialidade.',1),(24,8,'O que fazer quando encontro um erro no sistema?','Registre as informações sobre o problema e comunique o responsável pelo suporte ou pela administração do SIAE.',1);
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs_categories`
--

DROP TABLE IF EXISTS `faqs_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs_categories`
--

LOCK TABLES `faqs_categories` WRITE;
/*!40000 ALTER TABLE `faqs_categories` DISABLE KEYS */;
INSERT INTO `faqs_categories` VALUES (1,'Acesso e autenticação',1),(2,'Cadastro e usuários',1),(3,'Ocorrências',1),(4,'Atendimentos e acompanhamentos',1),(5,'Relatórios e documentos',1),(6,'Notificações',1),(7,'Privacidade e permissões',1),(8,'Dúvidas gerais',1);
/*!40000 ALTER TABLE `faqs_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` longtext NOT NULL,
  `is_read` tinyint NOT NULL,
  `active` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Notifications_User1_idx` (`user_id`),
  CONSTRAINT `fk_Notifications_User1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `occurrences`
--

DROP TABLE IF EXISTS `occurrences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `occurrences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `sector_id` int NOT NULL,
  `user_id` int NOT NULL,
  `student_id` int NOT NULL,
  `title` varchar(45) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `status` enum('Encerrado','Ativo','Interrompido') NOT NULL,
  `secrecy_level` enum('Todas as entidades','Entidades especificas','Apenas esta entidade') NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `class` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Occurrence_User1_idx` (`user_id`),
  KEY `fk_occurrences_student_idx` (`student_id`),
  KEY `fk_occurrences_sectors` (`sector_id`),
  KEY `fk_occurrences_services` (`service_id`),
  CONSTRAINT `fk_occurrences_sectors` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`),
  CONSTRAINT `fk_occurrences_services` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `fk_occurrences_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_occurrences_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `occurrences`
--

LOCK TABLES `occurrences` WRITE;
/*!40000 ALTER TABLE `occurrences` DISABLE KEYS */;
INSERT INTO `occurrences` VALUES (1,1,3,3,5,'Primeiro atendimento','Aluno apresentou dificuldades emocionais','Ativo','Apenas esta entidade','2026-10-29 10:04:50',NULL,1,'INFO 1A'),(2,2,2,4,6,'Acompanhamento escolar','Baixo rendimento em matemática','Ativo','Entidades especificas','2026-10-29 10:04:50',NULL,1,'INFO 2A');
/*!40000 ALTER TABLE `occurrences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(45) NOT NULL,
  `content` longtext NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_Reports_User1_idx` (`user_id`),
  CONSTRAINT `fk_Reports_User1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sectors`
--

DROP TABLE IF EXISTS `sectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sectors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sectors`
--

LOCK TABLES `sectors` WRITE;
/*!40000 ALTER TABLE `sectors` DISABLE KEYS */;
INSERT INTO `sectors` VALUES (1,'Direção','Setor administrativo geral',1,'2026-10-29 10:04:50',NULL),(2,'Orientação','Acompanhamento pedagógico',1,'2026-10-29 10:04:50',NULL),(3,'Psicologia','Atendimento psicológico',1,'2026-10-29 10:04:50',NULL);
/*!40000 ALTER TABLE `sectors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `observations` longtext,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `student_id` int NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_Services_User1_idx` (`user_id`),
  KEY `fk_services_student_idx` (`student_id`),
  CONSTRAINT `fk_services_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_Services_User1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,3,'Atendimento psicológico inicial','2026-10-29 10:04:50',NULL,5,1),(2,4,'Acompanhamento pedagógico','2026-10-29 10:04:50',NULL,6,1);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shares`
--

DROP TABLE IF EXISTS `shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `occurrence_id` int NOT NULL,
  `user_id` int NOT NULL,
  `active` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_Shares_User1_idx` (`user_id`),
  KEY `fk_Shares_occurrence1_idx` (`occurrence_id`),
  CONSTRAINT `fk_Shares_occurrence1` FOREIGN KEY (`occurrence_id`) REFERENCES `occurrences` (`id`),
  CONSTRAINT `fk_Shares_User1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shares`
--

LOCK TABLES `shares` WRITE;
/*!40000 ALTER TABLE `shares` DISABLE KEYS */;
/*!40000 ALTER TABLE `shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treatment_reports`
--

DROP TABLE IF EXISTS `treatment_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treatment_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `treatment_id` int NOT NULL,
  `report_id` int NOT NULL,
  `action` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_treatment_reports_treatments1_idx` (`treatment_id`),
  KEY `fk_treatment_reports_reports1_idx` (`report_id`),
  CONSTRAINT `fk_treatment_reports_reports1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`),
  CONSTRAINT `fk_treatment_reports_treatments1` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatment_reports`
--

LOCK TABLES `treatment_reports` WRITE;
/*!40000 ALTER TABLE `treatment_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `treatment_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treatment_services`
--

DROP TABLE IF EXISTS `treatment_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treatment_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `treatment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_treatment_service` (`treatment_id`,`service_id`),
  KEY `fk_treatment_services_treatments1_idx` (`treatment_id`),
  KEY `fk_treatment_services_services1_idx` (`service_id`),
  CONSTRAINT `fk_treatment_services_services1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `fk_treatment_services_treatments1` FOREIGN KEY (`treatment_id`) REFERENCES `treatments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatment_services`
--

LOCK TABLES `treatment_services` WRITE;
/*!40000 ALTER TABLE `treatment_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `treatment_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treatments`
--

DROP TABLE IF EXISTS `treatments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treatments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `occurrence_id` int NOT NULL,
  `title` varchar(45) NOT NULL,
  `content` longtext,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_treatments_occurrences1_idx` (`occurrence_id`),
  CONSTRAINT `fk_treatments_occurrences1` FOREIGN KEY (`occurrence_id`) REFERENCES `occurrences` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treatments`
--

LOCK TABLES `treatments` WRITE;
/*!40000 ALTER TABLE `treatments` DISABLE KEYS */;
/*!40000 ALTER TABLE `treatments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sector_id` int DEFAULT NULL,
  `class_id` int DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` varchar(500) DEFAULT NULL,
  `active` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `enrollment` enum('administrador','profissional','estudante') NOT NULL,
  `date_birth` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_users_sectors_idx` (`sector_id`),
  KEY `fk_users_classes_idx` (`class_id`),
  CONSTRAINT `fk_users_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`),
  CONSTRAINT `fk_users_sectors` FOREIGN KEY (`sector_id`) REFERENCES `sectors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,NULL,'Maria Clara Santos','maria.admin@siae.com','123456',NULL,1,'2026-10-29 10:04:50',NULL,'administrador','1985-03-15'),(2,1,NULL,'João Pedro Oliveira','joao.admin@siae.com','123456',NULL,1,'2026-10-29 10:04:50',NULL,'administrador','1988-09-22'),(3,2,NULL,'Fernanda Rocha','fernanda.prof@siae.com','123456',NULL,1,'2026-10-29 10:04:50',NULL,'profissional','1990-06-10'),(4,3,NULL,'Ricardo Mendes','ricardo.prof@siae.com','123456',NULL,1,'2026-10-29 10:04:50',NULL,'profissional','1987-11-05'),(5,NULL,1,'Juliana Almeida','juliana.est@siae.com','123456',NULL,1,'2026-10-29 10:04:50',NULL,'estudante','2008-04-18'),(6,NULL,2,'Lucas Ferreira','lucas.est@siae.com','123456',NULL,1,'2026-10-29 10:04:50',NULL,'estudante','2007-12-30'),(7,3,NULL,'Robertinho','roberto@siae.com','$2y$10$9ZelB2PRuGQH6.LGR1oHrOcC8T1hLFVf7imGEw',NULL,1,'0000-00-00 00:00:00','0000-00-00 00:00:00','profissional','1511-12-14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_types`
--

DROP TABLE IF EXISTS `users_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_users_types_User1_idx` (`user_id`),
  CONSTRAINT `fk_users_types_User1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_types`
--

LOCK TABLES `users_types` WRITE;
/*!40000 ALTER TABLE `users_types` DISABLE KEYS */;
INSERT INTO `users_types` VALUES (1,1,'administrador',1),(2,2,'administrador',1),(3,3,'profissional',1),(4,4,'profissional',1),(5,5,'estudante',1),(6,6,'estudante',1);
/*!40000 ALTER TABLE `users_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 11:10:25
