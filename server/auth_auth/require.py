import abc
from typing import Dict

from flask_login import current_user

from werkzeug.exceptions import Forbidden

from server.auth_auth.special_permissions import (
    UserInvitePermission,
    EmailPermission,
    PaymentReceiptsPermission,
)
from server.models import User, Teacher, Attendance, Student, Course, Role, Schedule, Guardian


class BaseCRUD(abc.ABC):
    @abc.abstractmethod
    def create(self, obj: object) -> bool:
        raise NotImplementedError

    @abc.abstractmethod
    def read(self, obj: object) -> bool:
        raise NotImplementedError

    @abc.abstractmethod
    def update(self, obj: object) -> bool:
        raise NotImplementedError

    @abc.abstractmethod
    def delete(self, obj: object) -> bool:
        raise


class BaseCRUDRolePermissions(BaseCRUD, abc.ABC):
    def __init__(self, user: "User"):
        self.user = user


class EnsureCRUDRolePermissions(BaseCRUD):
    def __init__(self, permission_provider: BaseCRUDRolePermissions):
        self.permission_provider = permission_provider

    @staticmethod
    def _ensure(result: bool):
        if not result:
            raise Forbidden()  # todo more informative
        return result

    def create(self, obj: object) -> bool:
        return self._ensure(self.permission_provider.create(obj))

    def read(self, obj: object) -> bool:
        return self._ensure(self.permission_provider.read(obj))

    def update(self, obj: object) -> bool:
        return self._ensure(self.permission_provider.update(obj))

    def delete(self, obj: object) -> bool:
        return self._ensure(self.permission_provider.delete(obj))


class EmptyCRUDRolePermissions(BaseCRUDRolePermissions):
    def create(self, obj: object) -> bool:
        return False

    def read(self, obj: object) -> bool:
        return False

    def update(self, obj: object) -> bool:
        return False

    def delete(self, obj: object) -> bool:
        return False


class AdministratorCRUDRolePermissions(BaseCRUDRolePermissions):
    def create(self, obj: object) -> bool:
        return True

    def read(self, obj: object) -> bool:
        return True

    def update(self, obj: object) -> bool:
        return True

    def delete(self, obj: object) -> bool:
        return True


class LaymanCRUDRolePermissions(EmptyCRUDRolePermissions):
    NOT_ALLOWED_RESOURCES = (
        User,
        PaymentReceiptsPermission,
        EmailPermission,
        UserInvitePermission,
    )

    @classmethod
    def _is_allowed_resource(cls, obj: object) -> bool:
        if type(obj) in cls.NOT_ALLOWED_RESOURCES:
            return False
        return True

    def read(self, obj: object) -> bool:
        return self._is_allowed_resource(obj)


class AdministrativeCRUDRolePermissions(LaymanCRUDRolePermissions):
    NOT_ALLOWED_RESOURCES = (User,)

    def create(self, obj: object) -> bool:
        return self._is_allowed_resource(obj)

    def update(self, obj: object) -> bool:
        return self._is_allowed_resource(obj)

    def delete(self, obj: object) -> bool:
        return self._is_allowed_resource(obj)


class TeacherCRUDRolePermissions(EmptyCRUDRolePermissions):
    def _is_allowed_resource(self, obj) -> bool:
        if self.user.teacher is None:
            return False
        if type(obj) == Schedule:
            return self.user.teacher.is_teacher_of_course(obj.course_id)
        if type(obj) == Teacher:
            if obj.id == self.user.teacher_id:
                return True
            return False
        if type(obj) == Course:
            return self.user.teacher.is_teacher_of_course(obj.id)
        if type(obj) == Student:
            return self.user.teacher.is_teacher_of_student(obj.id)
        if type(obj) == Guardian:
            return any(self.user.teacher.is_teacher_of_student(student.id) for student in obj.students)
        if type(obj) == Attendance:
            return self.user.teacher.is_teacher_of_course(obj.course_id)
        return False

    def create(self, obj: object) -> bool:
        return type(obj) == Attendance and self._is_allowed_resource(obj)

    def read(self, obj: object) -> bool:
        return self._is_allowed_resource(obj)

    def update(self, obj: object) -> bool:
        return type(obj) == Attendance


class Require:
    _NAME_PERMISSIONS_PROVIDER: Dict[str, type(BaseCRUDRolePermissions)] = {
        Role.EMPTY: EmptyCRUDRolePermissions,
        Role.LAYMAN: LaymanCRUDRolePermissions,
        Role.TEACHER: TeacherCRUDRolePermissions,
        Role.ADMINISTRATIVE: AdministrativeCRUDRolePermissions,
        Role.ADMINISTRATOR: AdministratorCRUDRolePermissions,
    }

    @classmethod
    def _permission_provider(cls):
        if not hasattr(current_user, "role") or current_user.role is None:
            return EmptyCRUDRolePermissions(None)

        try:
            return cls._NAME_PERMISSIONS_PROVIDER[current_user.role.id](current_user)
        except KeyError:
            raise NotImplementedError

    @classmethod
    @property
    def can(cls) -> BaseCRUDRolePermissions:
        return cls._permission_provider()

    @classmethod
    @property
    def ensure(cls):
        return EnsureCRUDRolePermissions(cls._permission_provider())
