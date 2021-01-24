from centrifuga4 import db
from centrifuga4.models._base import MyBase


class Label(MyBase):
    __tablename__ = "label"
    permissions = {}

    id = db.Column(db.Text, primary_key=True)
    courses = db.relationship(
        "Course", secondary="label_course", back_populates="labels"
    )

    def __repr__(self):
        return "<Label | %s>" % self.id
