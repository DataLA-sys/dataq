select e.*, d.name deparment
from
 db.departments_t d, db.employee_t e
where
 d.id = e.depid