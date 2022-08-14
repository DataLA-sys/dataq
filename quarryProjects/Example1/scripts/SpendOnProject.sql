select ep.pid, sum(s.hours * pay.pay) as amount
from
Pay, AllProjEmpl ep, spend s
where 
ep.eid = pay.eid
and
s.pid = ep.pid
group by ep.pid

