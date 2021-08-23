from server import db


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

