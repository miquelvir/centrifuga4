from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property

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

    @hybrid_property
    def schedules(self):
        if self.courses:
            for course in self.courses:
                for schedule in course.schedules:
                    yield schedule
        else:
            return []
