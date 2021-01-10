from sqlalchemy.orm import validates

from centrifuga4 import db
from centrifuga4.models._base import MyBase


class Schedule(MyBase):
    __tablename__ = "schedule"

    id = db.Column(db.Text,
                   primary_key=True)

    day_week = db.Column(db.Integer,
                         nullable=False)
    start_time = db.Column(db.Time,
                           nullable=False)
    end_time = db.Column(db.Time,
                         nullable=False)
    is_base = db.Column(db.Boolean, nullable=False, default=True) # todo to hybrid

    course_id = db.Column(db.Text,
                          db.ForeignKey('course.id'),
                          nullable=False)

    student_id = db.Column(db.Text,
                            db.ForeignKey('student.id'),
                            nullable=True)

    course = db.relationship("Course",
                             foreign_keys=course_id,
                             back_populates="schedules")


    @validates('day_week')
    def validation(self, key, value):
        assert type(value) is int and 0 <= value <= 6, \
            'value must be between 0 and 6, 0 being SUN, 1 MON, ..., and 6 SAT'
        return value

    def __repr__(self):
        return '<Schedule | %s - %s>' % (self.id, self.course_id)
