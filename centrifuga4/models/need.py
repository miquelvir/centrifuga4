from centrifuga4 import db
from centrifuga4.auth_auth.action_need import ActionNeed
from centrifuga4.auth_auth.resource_need import ResourceNeed

db.Table(
    "user_need",
    db.Column("user_id", db.Text, db.ForeignKey("user.id")),
    db.Column("need_id", db.Text, db.ForeignKey("need.id")),
)


class Need(db.Model):
    __tablename__ = "need"
    __mapper_args__ = {"polymorphic_identity": "need"}
    permissions = {}

    description = db.Column(db.Text, unique=False, nullable=False)
    id = db.Column(db.Text, unique=True, nullable=False, primary_key=True)
    type = db.Column(db.Text, unique=False, nullable=False)

    @property
    def need(self):
        if self.type == "res":
            return ResourceNeed(self.id)
        elif self.type == "action":
            return ActionNeed(self.id)
        raise NotImplementedError("type '%s' is not implemented" % self.type)
