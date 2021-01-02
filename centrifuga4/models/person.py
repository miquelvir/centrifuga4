import uuid

from sqlalchemy import case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates, column_property

from centrifuga4 import db
from centrifuga4.models._base import MyBase


class Person(MyBase):
    __tablename__ = "person"
    __mapper_args__ = {
        'polymorphic_identity': "person"
    }

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    surname1 = db.Column(db.Text, nullable=True)
    surname2 = db.Column(db.Text, nullable=True)
    email = db.Column(db.Text, nullable=True)
    phone = db.Column(db.Text, nullable=True)
    address = db.Column(db.Text, nullable=True)
    zip = db.Column(db.Integer, nullable=True)
    city = db.Column(db.Text, nullable=True)
    dni = db.Column(db.Text, nullable=True)
    gender = db.Column(db.Text, nullable=True)
    birth_date = db.Column(db.Date, nullable=True)
    country_of_origin = db.Column(db.Text, nullable=True)

    full_name = column_property(
        case([(name != None, name + " "),], else_="") +
        case([(surname1 != None, surname1 + " "), ], else_="") +
        case([(surname2 != None, surname2), ], else_=""))
    # todo full_name no accents with collate https://docs.sqlalchemy.org/en/13/core/sqlelement.html#sqlalchemy.sql.expression.collate


    @validates('name', 'surname1', 'surname2', 'email', 'address', 'zip', 'gender', 'city')
    def cleaner1(self, key, value):
        return value.lower().strip()

    @validates('dni', 'country_of_origin')
    def cleaner2(self, key, value):
        return value.upper().strip()

    @validates('phone')
    def cleaner3(self, key, value):
        return value.lower().replace(' ', '')

    """@validates('name')
    def _validate_name(self, key, name):
        print("val", key, name)
        if name == "papa":
            raise ModelFieldValidationError({
                "name": ["Found '%s', can't be papa."]
            })
        return "mama"""

    def __repr__(self):
        return '<Person - %s | %s>' % (type(self).__name__, self.id)
