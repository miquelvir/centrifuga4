from collections import Iterable

from flask_principal import Permission
from flask import g
from server import db
from server.auth_auth.new_needs import ADMINISTRATOR_LEVEL_NEEDS_ALL_VARIANTS, BaseNeed, \
    ADMINISTRATIVE_LEVEL_NEEDS_ALL_VARIANTS, LAYMAN_LEVEL_NEEDS
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from server.models import User


class RoleProvider:
    @classmethod
    def needs_for_role_id(cls, role_id: str) -> Iterable:
        if role_id == Role.ADMINISTRATOR:
            return ADMINISTRATOR_LEVEL_NEEDS_ALL_VARIANTS
        if role_id == Role.ADMINISTRATIVE:
            return ADMINISTRATIVE_LEVEL_NEEDS_ALL_VARIANTS
        if role_id == Role.LAYMAN:
            return LAYMAN_LEVEL_NEEDS
        return tuple()

    @classmethod
    def has_need(cls, role_id: str, user: 'User', need: BaseNeed):
        if role_id != Role.TEACHER:
            return False
        if user.teacher is None:
            return False
        if need.resource not in ('courses', 'students', 'attendance'):
            return False
        if need.action != 'read':
            return False
        if need.param is None:
            return False
        if need.resource == 'courses':
            return user.teacher.is_teacher_of_course(need.param)
        if need.resource == 'students':
            return user.teacher.is_teacher_of_student(need.param)
        return False


class Role(db.Model):
    __tablename__ = "role"
    __mapper_args__ = {"polymorphic_identity": "role"}
    permissions = {}

    id = db.Column(db.Text, unique=True, nullable=False, primary_key=True)
    description = db.Column(db.Text, unique=False, nullable=True)
    name = db.Column(db.Text, unique=False, nullable=False)

    ADMINISTRATOR = "administrator"
    ADMINISTRATIVE = "administrative"
    TEACHER = "teacher"
    LAYMAN = "layman"
    EMPTY = "empty"

    def user_representation(self):
        return self.id

    @staticmethod
    def _load_need_to_identity(need):
        g.identity.provides.add(need)

    def load_needs_to_identity(self):
        print("x")
        for need in RoleProvider.needs_for_role_id(self.id):
            print(f"loading need... {need}")
            self._load_need_to_identity(need)

    def load_needs_to_identity_for_permissions(self, user: 'User', permissions: Iterable[Permission]):
        for permission in permissions:
            for need in permission.needs:
                if RoleProvider.has_need(self.id, user, need):
                    self._load_need_to_identity(need)
