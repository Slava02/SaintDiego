SELECT count(*)
FROM `service_type` AS `st`
    LEFT JOIN (
        SELECT type_id,
            GREATEST(
                MAX(created_at),
                MAX(COALESCE(updated_at, '0000-00-00 00:00:00'))
            ) as last_service_date
        FROM `service` AS `s`
        WHERE (client_id = 40)
        GROUP BY `type_id`
    ) lsd ON st.id = lsd.type_id
WHERE (st.registration_available = true)
    AND (
        (lsd.last_service_date IS NULL)
        OR (st.min_period_days IS NULL)
        OR (st.min_period_days = 0)
        OR (
            DATEDIFF(CURRENT_DATE, lsd.last_service_date) >= st.min_period_days
        )
    )