from sqlalchemy.ext.hybrid import hybrid_property

from server import db
from server.auth_auth.new_needs import RoomsNeed
from server.models._base import MyBase


class Room(MyBase):
    __tablename__ = "room"
    permissions = {RoomsNeed}

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    capacity = db.Column(db.Integer, nullable=True)

    courses = db.relationship("Course", secondary="room_course", back_populates="rooms")

    def __repr__(self):
        return "<Room | %s - %s>" % (self.id, self.name)

    @hybrid_property
    def schedules(self):
        if self.courses:
            for course in self.courses:
                for schedule in course.schedules:
                    yield schedule
        else:
            return []

    def user_representation(self):
        return self.name
