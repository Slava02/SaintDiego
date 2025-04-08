SELECT e.id AS event_id,
    st.id AS service_type_id,
    st.name AS service_name,
    e.datetime,
    e.remaining_capacity,
    ts.title AS timeslot_title,
    l.name AS location_name,
    l.address AS location_address
FROM event e
    JOIN time_slot_service tss ON e.time_slot_service_id = tss.id
    JOIN time_slot ts ON tss.time_slot_id = ts.id
    JOIN service_type st ON e.service_type_id = st.id
    JOIN location l ON ts.location_id = l.id
    LEFT JOIN service_registration sr ON st.id = sr.service_type_id
WHERE -- Проверка для нового клиента (только анкетирование)
    (
        NOT EXISTS (
            SELECT 1
            FROM client
            WHERE id = ?
        )
        AND st.name = 'Анкетирование'
    )
    OR -- Проверка для заблокированного клиента (только консультация)
    (
        EXISTS (
            SELECT 1
            FROM client
            WHERE id = ?
                AND is_blocked = TRUE
        )
        AND st.name = 'Консультация'
    )
    OR -- Проверка для клиента, который не был больше года (только повторное собеседование)
    (
        EXISTS (
            SELECT 1
            FROM client c
            WHERE c.id = ?
                AND c.is_blocked = FALSE
                AND NOT EXISTS (
                    SELECT 1
                    FROM service s
                    WHERE s.client_id = c.id
                        AND s.created_at > DATE_SUB(NOW(), INTERVAL 1 YEAR)
                )
        )
        AND st.name = 'Повторное собеседование'
    )
    OR -- Обычный случай - проверка всех ограничений для стандартного клиента
    (
        EXISTS (
            SELECT 1
            FROM client
            WHERE id = ?
                AND is_blocked = FALSE
        ) -- Проверка минимального периода между услугами
        AND NOT EXISTS (
            SELECT 1
            FROM service s
                JOIN event_client ec ON s.client_id = ec.client_id
                JOIN event ev ON ec.event_id = ev.id
            WHERE s.client_id = ?
                AND ev.service_type_id = tss.service_type_id
                AND s.created_at > DATE_SUB(NOW(), INTERVAL sr.min_period_days DAY)
                AND ec.status = 'attend'
        ) -- Проверка окна бронирования
        AND e.datetime <= DATE_ADD(NOW(), INTERVAL tss.booking_window DAY) -- Проверка остаточной вместимости
        AND e.remaining_capacity > 0 -- Проверка общей вместимости таймслота
        AND (
            SELECT COUNT(DISTINCT ec.client_id)
            FROM event_client ec
                JOIN event e2 ON ec.event_id = e2.id
                JOIN time_slot_service tss2 ON e2.time_slot_service_id = tss2.id
            WHERE tss2.time_slot_id = ts.id
                AND DATE(e2.datetime) = DATE(e.datetime)
        ) < ts.capacity
    ) -- Только будущие события
    AND e.datetime > NOW()
ORDER BY e.datetime ASC;