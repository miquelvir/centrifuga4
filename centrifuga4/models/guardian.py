from centrifuga4 import db
from centrifuga4.models.person import Person

db.Table("student_guardian",
         db.Column("student_id", db.Text, db.ForeignKey('student.id')),
         db.Column("guardian_id", db.Text, db.ForeignKey('guardian.id')))


class Guardian(Person):
    __tablename__ = "guardian"
    __mapper_args__ = {
        'polymorphic_identity': "guardian"
    }

    id = db.Column(db.Text,
                   db.ForeignKey('person.id'),
                   primary_key=True)
    relation = db.Column(db.Text,
                         nullable=True)

    students = db.relationship("Student",
                               secondary="student_guardian",
                               back_populates="guardians")