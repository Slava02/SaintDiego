SELECT e.id AS event_id,
    e.datetime,
    st.name AS service_name,
    l.name AS location_name,
    e.capacity,
    (
        SELECT COUNT(*)
        FROM event_client ec
        WHERE ec.event_id = e.id
    ) AS registered_count,
    ts.capacity AS time_slot_capacity,
    (
        SELECT COUNT(DISTINCT ec.client_id)
        FROM event_client ec
            JOIN event e2 ON ec.event_id = e2.id
            JOIN time_slot_service tss2 ON e2.time_slot_service_id = tss2.id
        WHERE tss2.time_slot_id = ts.id
    ) AS time_slot_registered_count
FROM event e
    JOIN time_slot_service tss ON e.time_slot_service_id = tss.id
    JOIN time_slot ts ON tss.time_slot_id = ts.id
    JOIN service_type st ON e.service_type_id = st.id
    JOIN location l ON ts.location_id = l.id
WHERE e.datetime > NOW()
    AND e.datetime <= DATE_ADD(NOW(), INTERVAL tss.booking_window DAY)
    AND ts.status = 'active'
    AND e.capacity > (
        SELECT COUNT(*)
        FROM event_client ec
        WHERE ec.event_id = e.id
    )
    AND ts.capacity > (
        SELECT COUNT(DISTINCT ec.client_id)
        FROM event_client ec
            JOIN event e2 ON ec.event_id = e2.id
            JOIN time_slot_service tss2 ON e2.time_slot_service_id = tss2.id
        WHERE tss2.time_slot_id = ts.id
    )
    AND (
        (
            SELECT is_blocked
            FROM client
            WHERE id = ?
        ) = FALSE
        OR (
            SELECT is_blocked
            FROM client
            WHERE id = ?
        ) = TRUE
        AND st.id = (
            SELECT id
            FROM service_type
            WHERE special_type = 'consultation'
        )
    )
    AND (
        (
            SELECT MAX(s.created_at)
            FROM service s
            WHERE s.client_id = ?
        ) > DATE_SUB(NOW(), INTERVAL 1 YEAR)
        OR (
            SELECT MAX(s.created_at)
            FROM service s
            WHERE s.client_id = ?
        ) <= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        AND st.id = (
            SELECT id
            FROM service_type
            WHERE special_type = 'reinterview'
        )
    )
    AND (
        NOT EXISTS (
            SELECT 1
            FROM service s
                JOIN event_client ec ON ec.service_id = s.id
            WHERE s.client_id = ?
                AND s.type_id = st.id
                AND ec.status = 'attend'
        )
        OR (
            SELECT MAX(s.created_at)
            FROM service s
                JOIN event_client ec ON ec.service_id = s.id
            WHERE s.client_id = ?
                AND s.type_id = st.id
                AND ec.status = 'attend'
        ) < DATE_SUB(NOW(), INTERVAL st.min_period_days DAY)
    )
    AND (
        SELECT is_alive
        FROM client
        WHERE id = ?
    ) = TRUE
ORDER BY e.datetime;