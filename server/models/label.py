from server import db
from server.models._base import MyBase


class Label(MyBase):
    __tablename__ = "label"
    permissions = {}

    id = db.Column(db.Text, primary_key=True)
    courses = db.relationship(
        "Course", secondary="label_course", back_populates="labels"
    )

    def __repr__(self):
        return "<Label | %s>" % self.id

    def user_representation(self):
        return self.id
