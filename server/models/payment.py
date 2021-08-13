from sqlalchemy.orm import validates

from server import db
from server.auth_auth.new_needs import PaymentsNeed
from server.models._base import MyBase


class Payment(MyBase):
    __tablename__ = "payment"
    permissions = {PaymentsNeed}

    id = db.Column(db.Text, primary_key=True)
    quantity = db.Column(db.Float, nullable=False)
    method = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    concept = db.Column(db.Text, nullable=True)

    student_id = db.Column(db.Text, db.ForeignKey("student.id"))
    student = db.relationship("Student", back_populates="payments")

    @validates("method")
    def cleaner1(self, key, value):
        assert value in ("cash", "bank-transfer", "bank-direct-debit"), (
            "method must be either 'cash', 'bank-transfer' or 'bank-direct-debit', found '%s'"
            % value
        )
        return value

    def __repr__(self):
        return "<Payment | %s - %s>" % (self.id, self.date)

    def user_representation(self):
        return "(%s€ via %s, %s, %s)" % (
            self.quantity,
            self.method,
            self.date,
            self.concept,
        )
