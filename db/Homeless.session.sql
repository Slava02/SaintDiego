INSERT INTO service_registration (
        min_period_days,
        service_type_id,
        service_type_name
    )
VALUES (14, 2, 'Продуктовый набор (без дома)');
INSERT INTO service_registration (
        min_period_days,
        service_type_id,
        service_type_name
    )
VALUES (7, 3, 'Комплект одежды');
-- First, ensure the service type exists
INSERT INTO `service_type` (`id`, `name`)
VALUES (1, 'Исповедь') ON DUPLICATE KEY
UPDATE id = id;
-- Then insert or update the event
INSERT INTO `event` (
        `id`,
        `time_slot_service_id`,
        `service_name`,
        `capacity`,
        `datetime`,
        `service_type_id`
    )
VALUES (
        DEFAULT,
        1,
        'Исповедь',
        40,
        '2024-03-20 18:00:00',
        1
    ) ON DUPLICATE KEY
UPDATE capacity = 40,
    datetime = '2024-03-20 18:00:00',
    time_slot_service_id = 1;
INSERT INTO `time_slot` (
        `id`,
        `title`,
        `type`,
        `location_id`,
        `capacity`,
        `start_date`,
        `end_date`,
        `status`,
        `created_at`,
        `updated_at`
    )
VALUES (
        2,
        'Вечерняя служба',
        'recurring',
        1,
        100,
        '2024-03-20 18:00:00',
        '2024-03-20 19:00:00',
        'active',
        NOW(),
        NOW()
    ) ON DUPLICATE KEY
UPDATE start_date = '2024-03-20 18:00:00',
    end_date = '2024-03-20 19:00:00',
    status = 'active';