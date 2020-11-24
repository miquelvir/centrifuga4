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

    def has_guardians(self):
        return len(self.guardians) != 0
