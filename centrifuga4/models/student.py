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
    image_agreement = db.Column(db.Boolean, nullable=False, default=False)

    enrollment_status = db.Column(db.Text, nullable=False)

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

    @validates('default_payment_method')
    def cleaner1(self, key, value):
        assert value in ('cash', 'bank-transfer'), 'method must be either cash or bank-transfer, found %s' % value
        return value

    @validates('status')
    def cleaner2(self, key, value):
        assert value in ('enrolled', 'early-unenrolled', 'pre-enrolled'), \
            "status must be either 'enrolled', 'early-unenrolled', 'pre-enrolled'"
        return value

    def get_course_schedules(self):
        result = {}
        for course in self.courses:
            current = []
            for schedule in course.schedules:
                if self in schedule.students:
                    current.append("%s - %s (%s, %s)" % (schedule.start_date,
                                                     schedule.end_date,
                                                     schedule.periodicity,
                                                     schedule.room.name if schedule.room.name else 'Xamfrà'))
            result[course.id] = current
        return result
