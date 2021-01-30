from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates

from centrifuga4 import db
from centrifuga4.auth_auth.resource_need import SchedulesPermission
from centrifuga4.models._base import MyBase


class Schedule(MyBase):
    """
    day_week is an integer; 0 signifying sunday, 1 monday, and so on.
    """

    __tablename__ = "schedule"
    permissions = {SchedulesPermission}

    id = db.Column(db.Text, primary_key=True)

    day_week = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    course_id = db.Column(db.Text, db.ForeignKey("course.id"), nullable=False)

    student_id = db.Column(db.Text, db.ForeignKey("student.id"), nullable=True)

    student = db.relationship("Student", foreign_keys=student_id)
    course = db.relationship(
        "Course", foreign_keys=course_id, back_populates="schedules"
    )

    @hybrid_property
    def display_name(self) -> str:
        if self.is_base:
            return self.course.name
        return "%s - %s" % (self.course.name, self.student.full_name)

    @hybrid_property
    def is_base(self) -> bool:
        return self.student_id is None

    @validates("day_week")
    def validation(self, key, value):
        assert (
            type(value) is int and 0 <= value <= 6
        ), "value must be between 0 and 6, 0 being SUN, 1 MON, ..., and 6 SAT"
        return value

    def __repr__(self):
        return "<Schedule | %s - %s>" % (self.id, self.course_id)

    def user_representation(self):
        return "(%s, %s - %s, %s, %s)" % (
            self.day_week,
            self.start_time,
            self.end_time,
            self.course.name,
            "common" if self.is_base else self.student_id,
        )
