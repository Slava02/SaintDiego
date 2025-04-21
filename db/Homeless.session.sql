-- SELECT ts.id
-- FROM `time_slot` AS `ts`
--     JOIN time_slot_service tss ON ts.id = tss.time_slot_id
--     JOIN event e ON tss.id = e.time_slot_service_id
-- WHERE (e.id = 50);
SELECT ts.*,
    COUNT(ec.id) as participant_count
FROM `time_slot` AS `ts`
    JOIN time_slot_service tss ON ts.id = tss.time_slot_id
    JOIN event e ON tss.id = e.time_slot_service_id
    LEFT JOIN event_client ec ON e.id = ec.event_id
WHERE (ts.id = 6)