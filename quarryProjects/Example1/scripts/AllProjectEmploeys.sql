select c.eid, p.id as pid, p.name as pname
from
projectCrew c, Projects p
where
c.pid = p.id