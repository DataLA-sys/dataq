select e.id as eid, d.id as did, e.fio, d.name as depname
from
db.t_dep d, db.t_employee e
where d.id = e.id