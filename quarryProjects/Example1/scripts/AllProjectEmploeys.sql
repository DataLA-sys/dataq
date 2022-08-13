select c.eid, p.id as pid, p.name as pname
from
db.projectCrew c, db.projects p
where
c.pid = p.id