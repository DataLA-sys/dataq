select 
e.eid, pay.pay
from
db.pay_t pay, db.EmployeesAndDepartmens e
where
pay.eid = e.eid
