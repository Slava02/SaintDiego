SELECT *
FROM `event` AS `e`
    LEFT JOIN event_client ec ON e.id = ec.event_id
WHERE (ec.client_id = 5)