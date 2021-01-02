from sqlalchemy import cast, String, case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property

from centrifuga4 import db
from centrifuga4.models.person import Person


class Student(Person):
    __tablename__ = "student"
    __mapper_args__ = {
        'polymorphic_identity': "student"
    }

    id = db.Column(db.Text,
                   db.ForeignKey('person.id'),
                   primary_key=True)

    price_term = db.Column(db.Float, nullable=True)

    courses = db.relationship("Course",
                              secondary="student_course",
                              back_populates="students")
    payments = db.relationship("Payment",
                               back_populates="student")
    schedules = db.relationship("Schedule",
                                secondary="student_schedule",
                                back_populates="students")
    guardians = db.relationship("Guardian",
                                secondary="student_guardian",
                                back_populates="students")
