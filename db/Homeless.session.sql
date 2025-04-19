SELECT `st`.`id`,
    `st`.`name`,
    `st`.`registration_available`,
    `st`.`min_period_days`
FROM `service_type` AS `st`,
    service_type st
    LEFT JOIN (
        SELECT type_id,
            GREATEST(
                MAX(created_at),
                MAX(COALESCE(updated_at, '0000-00-00 00:00:00'))
            ) as last_service_date
        FROM `service` AS `s`
        WHERE (client_id = 1538)
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
ORDER BY st.sort ASC,
    st.name ASC
LIMIT 20;
-- WITH LastServiceDate AS (
--     SELECT s.type_id,
--         GREATEST(
--             MAX(s.created_at),
--             MAX(COALESCE(s.updated_at, '0000-00-00 00:00:00'))
--         ) as last_service_date
--     FROM `service` AS `s`
--     WHERE s.client_id = 1537
--     GROUP BY s.type_id
-- )
-- SELECT st.*
-- FROM service_type st
--     LEFT JOIN LastServiceDate lsd ON st.id = lsd.type_id
-- WHERE st.registration_available = true
--     AND (
--         lsd.last_service_date IS NULL -- Клиент никогда не получал услугу данного типа
--         OR st.min_period_days IS NULL -- Нет ограничения по периоду
--         OR st.min_period_days = 0 -- Период ожидания равен нулю
--         OR DATEDIFF(CURRENT_DATE, lsd.last_service_date) >= st.min_period_days -- Прошло достаточно дней
--     )
-- ORDER BY st.sort ASC,
--     st.name ASC;