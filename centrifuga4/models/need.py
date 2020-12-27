from flask_login import UserMixin

from centrifuga4 import db
from centrifuga4.auth_auth.action_need import InvitePermission, EmailPermission, DeletePermission, PostPermission, \
    PatchPermission, GetPermission, ActionNeed
from centrifuga4.auth_auth.resource_need import StudentsPermission, TeachersPermission, UsersPermission, \
    CoursesPermission, GuardiansPermission, PaymentsPermission, RoomsPermission, SchedulesPermission, ResourceNeed
from centrifuga4.models.person import Person
from passlib.apps import custom_app_context as pwd_context
from flask_principal import Need as N

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

    @property
    def need(self):
        return N(self.name)
