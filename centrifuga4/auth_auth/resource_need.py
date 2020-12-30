from functools import partial

from flask_principal import Permission
from sqlalchemy.util import namedtuple


"""
A Need is the smallest level of granularity in Flask Principal.

ResourceNeed is, in the context of this project, a need which defines an API resource which a user
can or can not access.
"""

ResourceNeed = namedtuple('resource_need', ['resource'])

CoursesNeed = partial(ResourceNeed, 'courses')
GuardiansNeed = partial(ResourceNeed, 'guardians')
PaymentsNeed = partial(ResourceNeed, 'payments')
RoomsNeed = partial(ResourceNeed, 'rooms')
SchedulesNeed = partial(ResourceNeed, 'schedules')
StudentsNeed = partial(ResourceNeed, 'students')
TeachersNeed = partial(ResourceNeed, 'teachers')
UsersNeed = partial(ResourceNeed, 'users')


"""
A permission encapsulates a need, and can be used to check whether
the current Flask Principal identity has access to it.

Each need has an individual permission, which is used by default in the corresponding
resources of the API. There is no distinction between the individual and the collection resource.
E.g: the same StudentsPermission applies to /students and /students/<id>.
"""


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
