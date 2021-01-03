from sqlalchemy.orm import validates

from centrifuga4 import db
from centrifuga4.models._base import MyBase


db.Table("student_payment",
         db.Column("student_id", db.Text, db.ForeignKey('student.id')),
         db.Column("payment_id", db.Text, db.ForeignKey('payment.id')))


class Payment(MyBase):
    __tablename__ = "payment"

    id = db.Column(db.Text,
                   primary_key=True)
    quantity = db.Column(db.Float,
                         nullable=False)
    method = db.Column(db.Text,
                       nullable=False)
    date = db.Column(db.Date,
                     nullable=False)
    concept = db.Column(db.Text,
                        nullable=True)
    student = db.relationship("Student",
                              secondary="student_payment",
                              back_populates="payments")

    @validates('method')
    def cleaner1(self, key, value):
        assert value in ('cash', 'bank-transfer'), 'method must be either cash or bank-transfer, found %s' % value
        return value

    def __repr__(self):
        return '<Room | %s - %s>' % (self.id, self.date)



