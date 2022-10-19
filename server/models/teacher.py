import uuid

from flask import current_app
from sqlalchemy import case, text
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property, validates

from server import db
from server.models._base import MyBase


class Teacher(MyBase):
    __tablename__ = "teacher"
    __mapper_args__ = {"polymorphic_identity": "teacher"}

    id = db.Column(db.Text, primary_key=True)

    courses = db.relationship(
        "Course", secondary="teacher_course", back_populates="teachers"
    )

    name = db.Column(db.Text, nullable=False)
    surname1 = db.Column(db.Text, nullable=True)
    surname2 = db.Column(db.Text, nullable=True)
    email = db.Column(db.Text, nullable=True)
    phone = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=True)
    zip = db.Column(db.Integer, nullable=True)
    city = db.Column(db.Text, nullable=True)
    dni = db.Column(db.Text, nullable=True)

    calendar_id = db.Column(db.Text, nullable=False, default=lambda: str(uuid.uuid4()))

    full_name = column_property(
        case([(name != None, name + " ")], else_="")
        + case([(surname1 != None, surname1 + " ")], else_="")
        + case([(surname2 != None, surname2)], else_="")
    )

    def is_teacher_of_course(self, course_id: str):
        # todo maybe optimize
        return any(course.id == course_id for course in self.courses)

    def is_teacher_of_student(self, student_id: str):
        # todo maybe optimize
        for course in self.courses:
            for student in course.students:
                if student.id == student_id:
                    return True
        return False

    @validates(
        "name", "surname1", "surname2", "email", "address", "zip", "gender", "city"
    )
    def cleaner1(self, key, value):
        return str(value).lower().strip() if value else value

    @validates("dni")
    def cleaner2(self, key, value):
        return value.upper().strip() if value else value

    @validates("phone")
    def cleaner3(self, key, value):
        return str(value).lower().replace(" ", "") if value else value

    @validates("education_entity", "career")
    def cleaner1(self, key, value):
        return value.lower().strip() if value else value

    @validates("education_year")
    def cleaner_ed_year(self, key, value):
        assert value in (
            None,  # todo assert breaks, so we should raise an exception everywhere
            "kindergarten_p0",
            "kindergarten_p1",
            "kindergarten_p2",
            "kindergarten_p3",
            "kindergarten_p4",
            "kindergarten_p5",
            "primary_1",
            "primary_2",
            "primary_3",
            "primary_4",
            "primary_5",
            "primary_6",
            "eso_1",
            "eso_2",
            "eso_3",
            "eso_4",
            "baccalaureate_1",
            "baccalaureate_2",
            "FP_lower",
            "FP_higher",
            "undergraduate",
            "master",
            "phd",
            "other",
        )
        return value

    @validates("country_of_origin")
    def cleaner2(self, key, value):
        return value.upper().strip() if value else value

    @hybrid_property
    def calendar_url(self):
        return (
            current_app.config["BACKEND_SERVER_URL"]
            + "/calendars/v1/teachers/"
            + self.id
            + "/"
            + self.calendar_id
        )

    @hybrid_property
    def schedules(self):
        if self.courses:
            for course in self.courses:
                for schedule in course.schedules:
                    yield schedule
        else:
            return []
