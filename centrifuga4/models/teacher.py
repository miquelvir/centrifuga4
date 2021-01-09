from centrifuga4 import db
from centrifuga4.models.raw_person import RawPerson


class Teacher(RawPerson):
    __tablename__ = "teacher"
    __mapper_args__ = {
        'polymorphic_identity': "teacher"
    }

    id = db.Column(db.Text,
                   db.ForeignKey('raw_person.id'),
                   primary_key=True)

    courses = db.relationship("Course",
                              secondary="teacher_course",
                              back_populates="teachers")
    schedules = db.relationship("Schedule",
                                secondary="teacher_schedule",
                                back_populates="teachers")

