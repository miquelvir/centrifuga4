from functools import partial

from flask_principal import Permission
from sqlalchemy.util import namedtuple

ResourceNeed = namedtuple('resource_need', ['resource'])

CoursesNeed = partial(ResourceNeed, 'courses')
GuardiansNeed = partial(ResourceNeed, 'guardians')
PaymentsNeed = partial(ResourceNeed, 'payments')
RoomsNeed = partial(ResourceNeed, 'rooms')
SchedulesNeed = partial(ResourceNeed, 'schedules')
StudentsNeed = partial(ResourceNeed, 'students')
TeachersNeed = partial(ResourceNeed, 'teachers')
UsersNeed = partial(ResourceNeed, 'users')


class StudentsPermission(Permission):
    def __init__(self):
        need = StudentsNeed()
        super(StudentsPermission, self).__init__(need)


class TeachersPermission(Permission):
    def __init__(self):
        need = TeachersNeed()
        super(TeachersPermission, self).__init__(need)


class UsersPermission(Permission):
    def __init__(self):
        need = UsersNeed()
        super(UsersPermission, self).__init__(need)


class CoursesPermission(Permission):
    def __init__(self):
        need = CoursesNeed()
        super(CoursesPermission, self).__init__(need)


class GuardiansPermission(Permission):
    def __init__(self):
        need = GuardiansNeed()
        super(GuardiansPermission, self).__init__(need)


class PaymentsPermission(Permission):
    def __init__(self):
        need = PaymentsNeed()
        super(PaymentsPermission, self).__init__(need)


class RoomsPermission(Permission):
    def __init__(self):
        need = RoomsNeed()
        super(RoomsPermission, self).__init__(need)


class SchedulesPermission(Permission):
    def __init__(self):
        need = SchedulesNeed()
        super(SchedulesPermission, self).__init__(need)
