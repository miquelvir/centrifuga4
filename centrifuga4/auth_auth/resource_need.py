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
        super().__init__(StudentsNeed())


class TeachersPermission(Permission):
    def __init__(self):
        super().__init__(TeachersNeed())


class UsersPermission(Permission):
    def __init__(self):
        super().__init__(UsersNeed())


class CoursesPermission(Permission):
    def __init__(self):
        super().__init__(CoursesNeed())


class GuardiansPermission(Permission):
    def __init__(self):
        super().__init__(GuardiansNeed())


class PaymentsPermission(Permission):
    def __init__(self):
        super().__init__(PaymentsNeed())


class RoomsPermission(Permission):
    def __init__(self):
        super().__init__(RoomsNeed())


class SchedulesPermission(Permission):
    def __init__(self):
        super().__init__(SchedulesNeed())
