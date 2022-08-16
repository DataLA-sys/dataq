select p.id as pid, ed.eid, ed.fio, ed.depname, p.name pname
from
db.projects p, db.crew c, db.emp_and_dep ed
where
p.id = c.pid and ed.eid = c.eid
