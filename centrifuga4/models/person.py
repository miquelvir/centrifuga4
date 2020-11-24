import uuid

from sqlalchemy.orm import validates

from centrifuga4 import db


class Person(db.Model):
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
    address = db.Column(db.Text, nullable=True)  # todo maybe object
    zip = db.Column(db.Text, nullable=True)
    city = db.Column(db.Text, nullable=True)
    dni = db.Column(db.Text, nullable=True)
    gender = db.Column(db.Text, nullable=True)
    birth_date = db.Column(db.Date, nullable=True)
    country_of_origin = db.Column(db.Date, nullable=True)

    def __init__(self, *args, **kwargs):
        print("initing")
        print(args, kwargs)
        super().__init__(*args, **kwargs)

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
