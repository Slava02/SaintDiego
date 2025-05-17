SELECT e.*,
    COUNT(ec.id) as participants_count
FROM `event` AS `e`
    LEFT JOIN event_client ec ON e.id = ec.event_id
    JOIN time_slot_service ON e.time_slot_service_id = time_slot_service.id
    JOIN time_slot ON time_slot_service.time_slot_id = time_slot.id
    JOIN service_type ON e.service_type_id = service_type.id
WHERE (
        e.datetime <= DATE_ADD(
            CURDATE(),
            INTERVAL time_slot_service.booking_window DAY
        )
    )
    AND (ec.client_id = 19)
GROUP BY `e`.`id`