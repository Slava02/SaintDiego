CREATE TABLE IF NOT EXISTS `volounteer` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `client` (
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
) ENGINE = InnoDB AUTO_INCREMENT = 1530 DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
CREATE TABLE IF NOT EXISTS `service_type` (
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `location` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `address` varchar(255),
    `created_by_id` int(11) DEFAULT NULL,
    `updated_by_id` int(11) DEFAULT NULL,
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `time_slot` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `type` enum('single', 'recurring') NOT NULL,
    `location_id` int(11) NOT NULL,
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `service` (
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `time_slot_service` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `time_slot_id` int(11) NOT NULL,
    `service_type_id` int(11) NOT NULL,
    `default_capacity` int NOT NULL,
    `booking_window` int NOT NULL,
    `default_time` time NOT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_time_slot_service_time_slot_id` (`time_slot_id`),
    KEY `IDX_time_slot_service_service_type_id` (`service_type_id`),
    CONSTRAINT `FK_time_slot_service_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_time_slot_service_type` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `time_slot_recurrence` (
    `time_slot_id` int(11) NOT NULL,
    `frequency` enum('daily', 'weekly', 'monthly') NOT NULL,
    `interval` int NOT NULL DEFAULT 1,
    `end_type` enum('never', 'date') NOT NULL,
    `end_value` datetime DEFAULT NULL,
    PRIMARY KEY (`time_slot_id`),
    CONSTRAINT `FK_time_slot_recurrence` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `event` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `time_slot_service_id` int(11) NOT NULL,
    `capacity` int(11) NOT NULL,
    `datetime` datetime NOT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_event_time_slot_service_id` (`time_slot_service_id`),
    CONSTRAINT `FK_event_time_slot_service` FOREIGN KEY (`time_slot_service_id`) REFERENCES `time_slot_service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `event_client` (
    `event_id` int(11) NOT NULL,
    `client_id` int(11) NOT NULL,
    `volounteer_id` int(11) NOT NULL,
    `status` enum('attend', 'absent') NOT NULL DEFAULT 'absent',
    PRIMARY KEY (`event_id`, `client_id`, `volounteer_id`),
    KEY `IDX_event_client_event_id` (`event_id`),
    KEY `IDX_event_client_client_id` (`client_id`),
    KEY `IDX_event_client_volounteer_id` (`volounteer_id`),
    CONSTRAINT `FK_event_client_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_event_client_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_event_volounteer` FOREIGN KEY (`volounteer_id`) REFERENCES `volounteer` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
SHOW CREATE TABLE time_slot_service;