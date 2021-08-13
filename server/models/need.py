from server import db
from server.auth_auth.new_needs import BaseNeed

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

    resource = db.Column(db.Text, unique=False, nullable=False)
    action = db.Column(db.Text, unique=False, nullable=True)
    param = db.Column(db.Text, unique=False, nullable=True)

    @property
    def need(self):
        return BaseNeed(resource=self.resource,
                        action=self.action,
                        param=self.param)

    def user_representation(self):
        return self.id
