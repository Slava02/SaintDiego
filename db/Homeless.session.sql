SELECT c.id,
    c.photo_name,
    c.birth_date,
    c.gender,
    c.firstname AS first_name,
    c.middlename AS middle_name,
    c.lastname AS last_name,
    v.tg_id AS volunteer_tg,
    v.tg_login AS volunteer_tg_login,
    v.first_name AS volounteer_first_name,
    v.middle_name AS volounteer_middle_name,
    v.last_name AS volounteer_last_name
FROM `client` AS `c`
    JOIN event_client ec ON ec.client_id = c.id
    JOIN volunteer v ON ec.volunteer_id = v.tg_id
WHERE (ec.event_id = 1)
LIMIT 20