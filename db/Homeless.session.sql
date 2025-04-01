SELECT ts.id as time_slot_id,
    ts.status as time_slot_status,
    tsr.frequency as recurrence_frequency,
    tsr.end_type as recurrence_end_type,
    tsr.end_value as recurrence_end_value,
    GROUP_CONCAT(
        DISTINCT tss.id
        ORDER BY tss.id SEPARATOR ' '
    ) as services,
    COUNT(DISTINCT e.id) as total_events
FROM time_slot ts
    LEFT JOIN time_slot_recurrence tsr ON ts.id = tsr.time_slot_id
    LEFT JOIN time_slot_service tss ON ts.id = tss.time_slot_id
    LEFT JOIN service_type st ON tss.service_type_id = st.id
    LEFT JOIN event e ON tss.id = e.time_slot_service_id
GROUP BY ts.id,
    ts.title,
    ts.type,
    ts.capacity,
    ts.status,
    tsr.frequency,
    tsr.interval,
    tsr.end_type,
    tsr.end_value
ORDER BY ts.id;