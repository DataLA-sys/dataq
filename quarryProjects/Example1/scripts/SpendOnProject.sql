insert into db.projectSpend
select ep.pid, sum(s.hours * pay.pay) as amount
from
db.Pay, db.AllProjectEmploeys ep, db.spend_t s
where 
ep.eid = pay.eid
and
s.pid = ep.pid
group by ep.pid

