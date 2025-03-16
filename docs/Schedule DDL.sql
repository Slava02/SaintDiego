-- Существующая таблица типов услуг (не изменяется)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Существующая таблица услуг (не изменяется)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Таблица локаций
CREATE TABLE `location` (
    `id` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `address` varchar(255),
    `created_by_id` int(11) DEFAULT NULL,
    `updated_by_id` int(11) DEFAULT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `IDX_location_created_by` (`created_by_id`),
    KEY `IDX_location_updated_by` (`updated_by_id`),
    CONSTRAINT `FK_location_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
    CONSTRAINT `FK_location_updated_by` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица временных слотов
CREATE TABLE `time_slot` (
    `id` varchar(36) NOT NULL,
    `title` varchar(255) NOT NULL,
    `type` enum('single', 'recurring') NOT NULL,
    `location_id` varchar(36) NOT NULL,
    `capacity` int NOT NULL,
    `start_date` datetime NOT NULL,
    `end_date` datetime NOT NULL,
    `status` enum('active', 'archived') NOT NULL DEFAULT 'active',
    `created_by_id` int(11) DEFAULT NULL,
    `updated_by_id` int(11) DEFAULT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `IDX_time_slot_status` (`status`),
    KEY `IDX_time_slot_dates` (`start_date`, `end_date`),
    KEY `IDX_time_slot_created_by` (`created_by_id`),
    KEY `IDX_time_slot_updated_by` (`updated_by_id`),
    CONSTRAINT `FK_time_slot_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`),
    CONSTRAINT `FK_time_slot_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `fos_user_user` (`id`),
    CONSTRAINT `FK_time_slot_updated_by` FOREIGN KEY (`updated_by_id`) REFERENCES `fos_user_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица для повторяющихся слотов
CREATE TABLE `time_slot_recurrence` (
    `time_slot_id` varchar(36) NOT NULL,
    `frequency` enum('daily', 'weekly', 'monthly') NOT NULL,
    `interval` int NOT NULL DEFAULT 1,
    `end_type` enum('never', 'date') NOT NULL,
    `end_value` datetime DEFAULT NULL,
    PRIMARY KEY (`time_slot_id`),
    CONSTRAINT `FK_time_slot_recurrence` FOREIGN KEY (`time_slot_id`) 
        REFERENCES `time_slot` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица связи временных слотов и типов услуг
CREATE TABLE `time_slot_service` (
    `time_slot_id` varchar(36) NOT NULL,
    `service_type_id` int(11) NOT NULL,
    `capacity` int NOT NULL,
    `booking_window` int NOT NULL,
    `time` varchar(11) NOT NULL, -- Формат: "10:00-12:00"
    PRIMARY KEY (`time_slot_id`, `service_type_id`),
    CONSTRAINT `FK_time_slot_service_slot` FOREIGN KEY (`time_slot_id`) 
        REFERENCES `time_slot` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_time_slot_service_type` FOREIGN KEY (`service_type_id`) 
        REFERENCES `service_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;