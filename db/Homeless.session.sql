select e.*,
    count(ec.client_id) as participants_count
from event e
    left join event_client ec on e.id = ec.event_id
group by e.id