from sqlalchemy import cast, String, case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property, validates

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
    years_in_xamfra = db.Column(db.Integer, nullable=False)
    default_payment_method = db.Column(db.Text, nullable=True)
    payment_comments = db.Column(db.Text, nullable=True)
    other_comments = db.Column(db.Text, nullable=True)

    is_enrolled = db.Column(db.Boolean, nullable=False)
    is_early_unenrolled = db.Column(db.Boolean, nullable=False)

    courses = db.relationship("Course",
                              secondary="student_course",
                              back_populates="students")
    payments = db.relationship("Payment",
                               secondary="student_payment",
                               back_populates="student")
    schedules = db.relationship("Schedule",
                                secondary="student_schedule",
                                back_populates="students")
    guardians = db.relationship("Guardian",
                                secondary="student_guardian",
                                back_populates="students")

    @validates('default_payment_method')
    def cleaner1(self, key, value):
        assert value in ('cash', 'bank-transfer'), 'method must be either cash or bank-transfer, found %s' % value
        return value
