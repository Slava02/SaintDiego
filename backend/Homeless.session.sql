select time_slot.id as time_slot_id,
    time_slot_recurrence.frequency as time_slot_recurrence_frequency,
    GROUP_CONCAT(distinct time_slot_service.id SEPARATOR ', ') as time_slot_service_ids,
    count(event.id) as event_count
from time_slot
    left join time_slot_service on time_slot.id = time_slot_service.time_slot_id
    left join event on time_slot_service.id = event.time_slot_service_id
    left join time_slot_recurrence on time_slot.id = time_slot_recurrence.time_slot_id
group by time_slot.id;
-- INSERT INTO `time_slot_service` (
--         `id`,
--         `time_slot_id`,
--         `service_type_id`,
--         `capacity`,
--         `booking_window`,
--         `time`
--     )
-- VALUES (40, 18, 1, 5, 30, '2025-03-20 18:00:00');
-- SELECT *
-- FROM time_slot_service
-- WHERE id = 40;
-- select *
-- from time_slot;