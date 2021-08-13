from collections import namedtuple
from functools import partial
from typing import List, Iterable, Sequence, Callable, Optional

from flask_principal import Permission, IdentityContext, identity_loaded, Identity

from server import init_app, principal


# BaseNeed = namedtuple("resource_need", ["resource", "action", "param"])
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from server.models import User, Teacher


class BaseNeed:
    def __init__(self, resource: str, action: Optional[str], param: Optional[str]):
        self.resource = resource
        self.action = action
        self.param = param

    def satisfies(self, other):
        if type(other) is not BaseNeed:
            return False
        if self.resource != other.resource:
            return False
        if self.action != other.action and self.action is not None:
            return False
        if self.param != other.param and self.param is not None:
            return False
        return True

    def __iter__(self):
        yield self.resource
        yield self.action
        yield self.param

    def __hash__(self):
        return hash(tuple(self))

    def __repr__(self):
        return f"<BaseNeed resource={self.resource} action={self.action} param={self.param}>"


class MyPermission(Permission):
    def allows(self, identity: Identity):
        provides = identity.provides
        in_provides = lambda needed: any(need.satisfies(needed) for need in provides)
        if any(not in_provides(need) for need in self.needs):
            return False
        if any(need in provides for need in self.excludes):
            return False
        return True

    def __str__(self):
        return f"<MyPermission needs={[str(x) for x in self.needs]}>"


class NeedPermission:
    """
    A permission encapsulates a need, and can be used to check whether
    the current Flask Principal identity has access to it.

    Each need has an individual permission, which is used by default in the corresponding
    resources of the API. There is no distinction between the individual and the collection resource.
    E.g: the same StudentsPermission applies to /students and /students/<id>.
    """

    def __init__(self, need: partial):
        self.need = need()

    @property
    def permission(self) -> Permission:
        return MyPermission(self.need)

    def __str__(self):
        return f"<NeedPermission need={self.need}>"


class CrudNeed:
    """ a crud need is a Flask Principal Need's factory

    it creates needs for a specific resource and all possible NEED actions
    """

    CREATE = 'create'
    READ = 'read'
    UPDATE = 'update'
    DELETE = 'delete'

    ANY = None

    CRUD_ACTIONS = (CREATE, READ, UPDATE, DELETE, ANY)
    BASE_ACTIONS = (*CRUD_ACTIONS, ANY)

    def _validate_custom_actions(self, special_actions: Sequence[str]):
        for x in special_actions:
            if type(x) is not str:
                raise ValueError(f"special actions must be of type string, not {type(x)!r}")
            if x in self.BASE_ACTIONS:
                raise ValueError(
                    f"special actions must not override existing base actions, {x!r} is already present in {self.BASE_ACTIONS!r}")

    def __init__(self, resource: str, custom_actions: Sequence[str] = None):
        self._resource = resource

        self.ResourceNeed = partial(BaseNeed, self._resource)

        if custom_actions is None:
            custom_actions = tuple()
        self._validate_custom_actions(custom_actions)
        self._custom_actions = tuple(x for x in custom_actions)  # copy

    def _base_action(self, action: str, param: Optional[str]):
        if param is None:
            param = CrudNeed.ANY  # no arg specified, so need/permission valid for all args (e.g. all ids)

        constructed_need = partial(self.ResourceNeed, action, param)

        return NeedPermission(constructed_need)

    def create(self) -> NeedPermission:
        return self._base_action(CrudNeed.CREATE, None)

    def read(self, id_: Optional[str] = None) -> NeedPermission:
        return self._base_action(CrudNeed.READ, id_)

    def update(self, id_: Optional[str] = None) -> NeedPermission:
        return self._base_action(CrudNeed.UPDATE, id_)

    def delete(self, id_: Optional[str] = None) -> NeedPermission:
        return self._base_action(CrudNeed.DELETE, id_)

    def any(self, id_: Optional[str] = None) -> NeedPermission:
        return self._base_action(CrudNeed.ANY, id_)

    def all(self):
        yield self.create()
        yield self.read()
        yield self.update()
        yield self.delete()
        yield self.any()

    def __getattr__(self, custom_action) -> Callable[[], NeedPermission]:
        """ allows accessing custom actions as attributes """
        if custom_action not in self._custom_actions:
            raise AttributeError(custom_action)
        return lambda id_=None: self._base_action(custom_action, id_)


CoursesNeed = CrudNeed('courses')
GuardiansNeed = CrudNeed('guardians')
PaymentsNeed = CrudNeed('payments', ('make_receipts',))
RoomsNeed = CrudNeed('rooms')
SchedulesNeed = CrudNeed('schedules')
StudentsNeed = CrudNeed('students', ('make_grant_letter', ))
TeachersNeed = CrudNeed('teachers')
UsersNeed = CrudNeed('users', ('make_invites',))
AttendanceNeed = CrudNeed('attendance')
EmailNeed = CrudNeed('emails')

ADMINISTRATIVE_LEVEL_NEEDS = (
    CoursesNeed,
    GuardiansNeed,
    PaymentsNeed,
    RoomsNeed,
    SchedulesNeed,
    StudentsNeed,
    TeachersNeed,
    AttendanceNeed,
    EmailNeed
)

ADMINISTRATOR_LEVEL_NEEDS = (
    *ADMINISTRATIVE_LEVEL_NEEDS,
    UsersNeed,
)

ADMINISTRATOR_LEVEL_NEEDS_ALL_VARIANTS = []
for need in ADMINISTRATOR_LEVEL_NEEDS:
    for n in need.all():
        ADMINISTRATOR_LEVEL_NEEDS_ALL_VARIANTS.append(n.need)


ADMINISTRATIVE_LEVEL_NEEDS_ALL_VARIANTS = []
for need in ADMINISTRATIVE_LEVEL_NEEDS:
    for n in need.all():
        ADMINISTRATIVE_LEVEL_NEEDS_ALL_VARIANTS.append(n.need)


LAYMAN_LEVEL_NEEDS = []
for need in ADMINISTRATIVE_LEVEL_NEEDS:
    LAYMAN_LEVEL_NEEDS.append(need.read().need)


class Role:
    def __init__(self, needs: Sequence):
        self.needs = needs

    def get_needs(self, user: 'User'):
        return self.needs


class TeacherRole(Role):
    def __init__(self):
        super().__init__(tuple())

    def get_needs(self, user: 'User'):
        needs = list(self.needs)

        teacher: 'Teacher' = user.teacher
        if teacher is not None:
            for course in teacher.courses:
                needs.append(CoursesNeed.read(course.id).need)
                for student in course.students:
                    needs.append(StudentsNeed.read(student.id))

        return needs


LaymanRole = Role(tuple())
AdministratorRole = Role(
    tuple(need.any() for need in ADMINISTRATOR_LEVEL_NEEDS)
)
AdministrativeRole = Role(
    tuple(need.any() for need in ADMINISTRATIVE_LEVEL_NEEDS)
)
TeacherRole = TeacherRole()


if __name__ == "__main__":
    print(CoursesNeed.read())
    print(CoursesNeed.read().need)
    print(CoursesNeed.read().permission)
    print(StudentsNeed.read(id_="student8").need)
    print(StudentsNeed.read(id_="student8").permission)
    print(UsersNeed.make_invites().need)
    print(UsersNeed.make_invites().permission)

    app = init_app()

    i = Identity(1)
    i.provides.add(StudentsNeed.any(id_="student8").need)

    with app.app_context():
        print(StudentsNeed.read(id_="student8").permission.allows(i))

    print(StudentsNeed.read(id_="student8").permission.needs)
