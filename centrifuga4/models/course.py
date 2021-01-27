from sqlalchemy.ext.hybrid import hybrid_property

from centrifuga4 import db
from centrifuga4.auth_auth.resource_need import CoursesPermission
from centrifuga4.models._base import MyBase

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
    permissions = {CoursesPermission}

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_term = db.Column(db.Float, nullable=False, default=60)
    is_published = db.Column(db.Boolean, nullable=False, default=False)

    rooms = db.relationship("Room", secondary="room_course", back_populates="courses")
    teachers = db.relationship(
        "Teacher", secondary="teacher_course", back_populates="courses"
    )
    students = db.relationship(
        "Student", secondary="student_course", back_populates="courses"
    )
    schedules = db.relationship("Schedule", back_populates="course")
    labels = db.relationship(
        "Label", secondary="label_course", back_populates="courses"
    )

    @hybrid_property
    def base_schedules(self):
        return [schedule for schedule in self.schedules if schedule.is_base]

    def __repr__(self):
        return "<Course | %s - %s>" % (self.id, self.name)

    def user_representation(self):
        return self.name
