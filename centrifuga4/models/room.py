from centrifuga4 import db


class Room(db.Model):
    __tablename__ = "room"

    id = db.Column(db.Text,
                   primary_key=True)
    name = db.Column(db.Text,
                     nullable=False)
    capacity = db.Column(db.Integer,
                         nullable=True)

    courses = db.relationship("Course",
                              secondary="room_course",
                              back_populates="rooms")
    schedules = db.relationship("Schedule",
                                back_populates="room")

    def __repr__(self):
        return '<Room | %s - %s>' % (self.id, self.name)

