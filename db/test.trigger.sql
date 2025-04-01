-- Insert test location
INSERT INTO `location` (`name`, `address`)
VALUES ('Test Location', '123 Test Street');
-- Insert test service type
INSERT INTO `service_type` (`name`, `pay`, `document`, `sort`)
VALUES ('Test Service', 1, 1, 1);
-- Insert test volunteer
INSERT INTO `volounteer` (`id`)
VALUES (1);
-- Insert test client
INSERT INTO `client` (
        `firstname`,
        `lastname`,
        `birth_date`,
        `gender`,
        `is_homeless`
    )
VALUES ('John', 'Doe', '1990-01-01', 1, 1);
-- Insert test time slot
INSERT INTO `time_slot` (
        `title`,
        `type`,
        `location_id`,
        `capacity`,
        `start_date`,
        `end_date`,
        `status`
    )
VALUES (
        'Test Time Slot',
        'single',
        1,
        10,
        NOW(),
        DATE_ADD(NOW(), INTERVAL 1 HOUR),
        'active'
    );
-- Insert test time slot service
INSERT INTO `time_slot_service` (
        `time_slot_id`,
        `service_type_id`,
        `capacity`,
        `booking_window`,
        `time`
    )
VALUES (1, 1, 10, 7, '10:00:00');
-- Insert test event
INSERT INTO `event` (
        `time_slot_service_id`,
        `service_type_id`,
        `capacity`,
        `datetime`
    )
VALUES (1, 1, 10, NOW());
-- Insert test event client (this will trigger update_remaining_capacity_insert)
INSERT INTO `event_client` (
        `event_id`,
        `client_id`,
        `volounteer_id`,
        `status`
    )
VALUES (1, 1, 1, 'attend');
-- Check remaining capacity after insert:
SELECT remaining_capacity
FROM event
WHERE id = 1;
Update event client status (
        this will trigger update_remaining_capacity_update
    )
UPDATE `event_client`
SET `status` = 'absent'
WHERE `event_id` = 1
    AND `client_id` = 1;
-- Check remaining capacity after update:
SELECT remaining_capacity
FROM event
WHERE id = 1;
Delete event client (
    this will trigger update_remaining_capacity_delete
)
DELETE FROM `event_client`
WHERE `event_id` = 1
    AND `client_id` = 1;
-- Check client service history after delete:
SELECT *
FROM client_service_history
WHERE client_id = 1;