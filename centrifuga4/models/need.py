from flask_login import UserMixin

from centrifuga4 import db
from centrifuga4.auth_auth.action_need import InvitePermission, EmailPermission, DeletePermission, PostPermission, \
    PatchPermission, GetPermission, ActionNeed
from centrifuga4.auth_auth.resource_need import StudentsPermission, TeachersPermission, UsersPermission, \
    CoursesPermission, GuardiansPermission, PaymentsPermission, RoomsPermission, SchedulesPermission, ResourceNeed
from centrifuga4.models.person import Person
from passlib.apps import custom_app_context as pwd_context


db.Table("user_need",
         db.Column("user_id", db.Text, db.ForeignKey('user.id')),
         db.Column("need_id", db.Integer, db.ForeignKey('need.id')))


class Need(db.Model):
    __tablename__ = "need"
    __mapper_args__ = {
        'polymorphic_identity': "need"
    }

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    description = db.Column(db.Text, unique=False, nullable=False)
    name = db.Column(db.Text, unique=True, nullable=False)
    type = db.Column(db.Text, unique=False, nullable=False)

    @property
    def permission(self):  # todo needed?
        if self.name == "res_students":
            return StudentsPermission
        if self.name == "res_teachers":
            return TeachersPermission
        if self.name == "res_users":
            return UsersPermission
        if self.name == "res_courses":
            return CoursesPermission
        if self.name == "res_guardians":
            return GuardiansPermission
        if self.name == "res_payments":
            return PaymentsPermission
        if self.name == "res_rooms":
            return RoomsPermission
        if self.name == "res_schedules":
            return SchedulesPermission
        if self.name == "action_get":
            return GetPermission
        if self.name == "action_patch":
            return PatchPermission
        if self.name == "action_post":
            return PostPermission
        if self.name == "action_delete":
            return DeletePermission
        if self.name == "action_sendEmails":
            return EmailPermission
        if self.name == "action_inviteUsers":
            return InvitePermission

        raise NotImplementedError("invalid permission name '%s'" % self.name)

    @property
    def need(self):
        if self.type == "action":
            return ActionNeed(self.name)
        elif self.type == "resource":
            return ResourceNeed(self.name)
        raise NotImplementedError("invalid need type '%s'" % self.type)
