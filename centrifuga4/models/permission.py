from flask_login import UserMixin

from centrifuga4 import db
from centrifuga4.models.person import Person
from passlib.apps import custom_app_context as pwd_context


class Permission(db.Model):
    __tablename__ = "permission"
    __mapper_args__ = {
        'polymorphic_identity': "permission"
    }

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.Text, unique=True, nullable=False)

    @property
    def permission(self):
        privileges = []

        if self.privilege_read:
            privileges.append("read")

        if self.privilege_edit:
            privileges.append("edit")

        if self.privilege_create:
            privileges.append("create")

        if self.privilege_send:
            privileges.append("send")

        if self.privilege_delete:
            privileges.append("delete")

        if self.privilege_users:
            privileges.append("users")

        return privileges
