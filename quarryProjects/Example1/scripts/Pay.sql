select 
e.id eid, pay.pay
from
PaySource pay, EmpAndDeps e
where
pay.eid = e.id
