from centrifuga4 import db


class Payment(db.Model):
    __tablename__ = "payment"

    id = db.Column(db.Integer,
                   primary_key=True)
    quantity = db.Column(db.Integer,
                         nullable=False)
    method = db.Column(db.Text,
                       nullable=True)
    date = db.Column(db.Date,
                     nullable=False)
    concept = db.Column(db.Text,
                        nullable=True)
    student_id = db.Column(db.Text,
                           db.ForeignKey('student.id'),
                           nullable=False)

    student = db.relationship("Student",
                              back_populates="payments",
                              foreign_keys=[student_id])

    def __repr__(self):
        return '<Room | %s - %s>' % (self.id, self.name)

