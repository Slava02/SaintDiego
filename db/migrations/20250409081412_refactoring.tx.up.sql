CREATE TABLE IF NOT EXISTS `volunteer` (
    `tg_id` BIGINT NOT NULL,
    `first_name` varchar(255) NOT NULL,
    `last_name` varchar(255) NOT NULL,
    `middle_name` varchar(255) NOT NULL,
    `tg_login` varchar(255) NOT NULL,
    PRIMARY KEY (`tg_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
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
--bun:split
ALTER TABLE `client`
ADD COLUMN IF NOT EXISTS `is_blocked` boolean NOT NULL DEFAULT false;
--bun:split
ALTER TABLE `client`
ADD COLUMN IF NOT EXISTS `blocked_reason` text;
--bun:split
ALTER TABLE `client`
ADD COLUMN IF NOT EXISTS `blocked_at` datetime;
--bun:split
CREATE TABLE IF NOT EXISTS `client_field_value` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `field_id` int(11) DEFAULT NULL,
    `client_id` int(11) DEFAULT NULL,
    `option_id` int(11) DEFAULT NULL,
    -- died = 949
    `created_by_id` int(11) DEFAULT NULL,
    `updated_by_id` int(11) DEFAULT NULL,
    `text` longtext COLLATE utf8_unicode_ci DEFAULT NULL,
    `datetime` datetime DEFAULT NULL,
    `filename` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `sync_id` int(11) DEFAULT NULL,
    `sort` int(11) DEFAULT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `value_unique` (`field_id`, `client_id`),
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
) ENGINE = InnoDB AUTO_INCREMENT = 23842 DEFAULT CHARSET = utf8 COLLATE = utf8_unicode_ci;
--bun:split
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
--bun:split
ALTER TABLE `service_type`
ADD COLUMN IF NOT EXISTS `registration_available` boolean NOT NULL DEFAULT false;
--bun:split
UPDATE `service_type`
SET `registration_available` = true
WHERE `id` IN (2, 3, 25, 30);
--bun:split
ALTER TABLE `service_type`
ADD COLUMN IF NOT EXISTS `min_period_days` int NOT NULL DEFAULT 0;
--bun:split
UPDATE `service_type`
SET `min_period_days` = CASE
        WHEN `id` = 2 THEN 14 -- продукты
        WHEN `id` = 25 THEN 14 -- стирка
        WHEN `id` = 30 THEN 30 -- стрижка
    END
WHERE `id` IN (2, 25, 30);
--bun:split
CREATE TABLE IF NOT EXISTS `location` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `address` varchar(255),
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
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
--bun:split
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
--bun:split
CREATE TABLE IF NOT EXISTS `time_slot_service` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `time_slot_id` int(11) NOT NULL,
    `service_type_id` int(11) NOT NULL,
    `capacity` int NOT NULL,
    `booking_window` int NOT NULL,
    `time` time NOT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_time_slot_service_time_slot_id` (`time_slot_id`),
    KEY `IDX_time_slot_service_service_type_id` (`service_type_id`),
    CONSTRAINT `FK_time_slot_service_slot` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_time_slot_service_type` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
CREATE TABLE IF NOT EXISTS `time_slot_recurrence` (
    `time_slot_id` int(11) NOT NULL,
    `frequency` enum('daily', 'weekly', 'monthly') NOT NULL,
    `interval` int NOT NULL DEFAULT 1,
    `end_type` enum('never', 'date') NOT NULL,
    `end_value` datetime DEFAULT NULL,
    PRIMARY KEY (`time_slot_id`),
    CONSTRAINT `FK_time_slot_recurrence` FOREIGN KEY (`time_slot_id`) REFERENCES `time_slot` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
CREATE TABLE IF NOT EXISTS `event` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `time_slot_service_id` int(11) NOT NULL,
    `service_type_id` int(11) NOT NULL,
    `capacity` int(11) NOT NULL,
    `datetime` datetime NOT NULL,
    `service_name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_event_time_slot_service_id` (`time_slot_service_id`),
    KEY `IDX_event_service_type_id` (`service_type_id`),
    CONSTRAINT `FK_event_time_slot_service` FOREIGN KEY (`time_slot_service_id`) REFERENCES `time_slot_service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_event_service_type` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
CREATE TABLE IF NOT EXISTS `event_client` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `event_id` int(11) NOT NULL,
    `client_id` int(11) NOT NULL,
    `volunteer_id` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_event_client_unique` (`event_id`, `client_id`, `volunteer_id`),
    KEY `IDX_event_client_event_id` (`event_id`),
    KEY `IDX_event_client_client_id` (`client_id`),
    KEY `IDX_event_client_volunteer_id` (`volunteer_id`),
    CONSTRAINT `FK_event_client_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_event_client_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_event_volunteer` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteer` (`tg_id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
CREATE TABLE IF NOT EXISTS schedule_users (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `login` varchar(255) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `is_admin` boolean NOT NULL DEFAULT false,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
--bun:split
INSERT INTO `schedule_users` (`login`, `password_hash`, `is_admin`)
VALUES (
        'admin',
        '$2a$13$cI4NIIfGiqgNsggT6yuxJOJsxY.haqepg7odDM2NeJcveDHD1bISm',
        true
    );
--bun:split
INSERT INTO `location` (`name`, `address`)
VALUES ('Центр социальной помощи', 'ул. Ленина, 10'),
    ('Социальный центр "Забота"', 'пр. Победы, 25'),
    ('Центр помощи бездомным', 'ул. Мира, 15'),
    ('Социальная служба "Добро"', 'ул. Советская, 8'),
    (
        'Центр социальной адаптации',
        'пр. Строителей, 42'
    );
--bun:split
INSERT INTO `volunteer` (
        `tg_id`,
        `first_name`,
        `last_name`,
        `middle_name`,
        `tg_login`
    )
VALUES (
        123456789,
        'Иван',
        'Иванов',
        'Иванович',
        'ivanov'
    ),
    (
        987654321,
        'Петр',
        'Петров',
        'Петрович',
        'petrov'
    ),
    (
        456789123,
        'Анна',
        'Сидорова',
        'Алексеевна',
        'sidorova'
    ),
    (
        789123456,
        'Мария',
        'Козлова',
        'Сергеевна',
        'kozlova'
    ),
    (
        321654987,
        'Алексей',
        'Смирнов',
        'Дмитриевич',
        'smirnov'
    );