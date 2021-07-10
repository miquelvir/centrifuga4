import uuid

from flask import current_app
from sqlalchemy import case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property

from server import db
from server.auth_auth.resource_need import TeachersPermission
from server.models._base import MyBase


class Teacher(MyBase):
    __tablename__ = "teacher"
    __mapper_args__ = {"polymorphic_identity": "teacher"}
    permissions = {TeachersPermission}

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
