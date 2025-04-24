SELECT e.*,
    COUNT(ec.id) as participants_count
FROM `event` AS `e`
    LEFT JOIN event_client ec ON e.id = ec.event_id
    JOIN time_slot_service tss ON e.time_slot_service_id = tss.id
WHERE (e.service_type_id = 15)
    AND (
        e.datetime <= DATE_ADD(CURDATE(), INTERVAL tss.booking_window DAY)
    )
GROUP BY `e`.`id`
HAVING (COUNT(ec.id) < e.capacity)
LIMIT 10