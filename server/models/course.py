import datetime
import uuid
from typing import Iterable

from flask import current_app
from sqlalchemy.ext.hybrid import hybrid_property

from server import db
from server.auth_auth.new_needs import CoursesNeed
from server.models._base import MyBase

db.Table(
    "teacher_course",
    db.Column("teacher_id", db.Text, db.ForeignKey("teacher.id")),
    db.Column("course_id", db.Text, db.ForeignKey("course.id")),
)

db.Table(
    "student_course",
    db.Column("student_id", db.Text, db.ForeignKey("student.id")),
    db.Column("course_id", db.Text, db.ForeignKey("course.id")),
)

db.Table(
    "room_course",
    db.Column("room_id", db.Text, db.ForeignKey("room.id")),
    db.Column("course_id", db.Text, db.ForeignKey("course.id")),
)

db.Table(
    "label_course",
    db.Column("label_id", db.Text, db.ForeignKey("label.id")),
    db.Column("course_id", db.Text, db.ForeignKey("course.id")),
)


class Course(MyBase):
    __tablename__ = "course"
    __mapper_args__ = {"polymorphic_identity": "course"}
    permissions = {CoursesNeed}

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_term = db.Column(db.Float, nullable=False, default=60)
    is_published = db.Column(db.Boolean, nullable=False, default=False)

    calendar_id = db.Column(db.Text, nullable=False, default=lambda: str(uuid.uuid4()))

    rooms = db.relationship("Room", secondary="room_course", back_populates="courses")
    teachers = db.relationship(
        "Teacher", secondary="teacher_course", back_populates="courses"
    )
    students = db.relationship(
        "Student", secondary="student_course", back_populates="courses"
    )
    schedules = db.relationship(
        "Schedule", cascade="all,delete", back_populates="course"
    )
    labels = db.relationship(
        "Label", secondary="label_course", back_populates="courses"
    )
    attendances = db.relationship("Attendance", back_populates="course")

    @hybrid_property
    def calendar_url(self):
        return (
            current_app.config["BACKEND_SERVER_URL"]
            + "/calendars/v1/courses/"
            + self.id
            + "/"
            + self.calendar_id
        )

    @hybrid_property
    def base_schedules(self):
        return [schedule for schedule in self.schedules if schedule.is_base]

    def __repr__(self):
        return "<Course | %s - %s>" % (self.id, self.name)

    def user_representation(self):
        return self.name

    def get_attendance(self, date: datetime.date = None) -> Iterable:
        for attendance in self.attendances:
            if date is None or attendance.date == date:
                yield attendance
