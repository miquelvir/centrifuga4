from sqlalchemy import case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates, column_property

from server import db
from server.models._base import MyBase
import datetime


class Person(MyBase):
    __tablename__ = "person"
    __mapper_args__ = {"polymorphic_identity": "person"}

    id = db.Column(db.Text, primary_key=True)
    country_of_origin = db.Column(db.Text, nullable=True)

    is_studying = db.Column(db.Boolean, nullable=False)
    education_year = db.Column(db.Text, nullable=True)
    education_entity = db.Column(db.Text, nullable=True)

    is_working = db.Column(db.Boolean, nullable=False)
    career = db.Column(db.Text, nullable=True)

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

    full_name = column_property(
        case([(name != None, name + " ")], else_="")
        + case([(surname1 != None, surname1 + " ")], else_="")
        + case([(surname2 != None, surname2)], else_="")
    )

    @validates(
        "name", "surname1", "surname2", "email", "address", "zip", "gender", "city"
    )
    def cleaner1(self, key, value):
        return str(value).lower().strip() if value else value

    @validates("dni")
    def cleaner2(self, key, value):
        return value.upper().strip() if value else value

    @validates("phone")
    def cleaner3(self, key, value):
        return str(value).lower().replace(" ", "") if value else value

    @validates("education_entity", "career")
    def cleaner1(self, key, value):
        return value.lower().strip() if value else value

    @validates("education_year")
    def cleaner_ed_year(self, key, value):
        assert value in (
            None,  # todo assert breaks, so we should raise an exception everywhere
            "kindergarten_p1",
            "kindergarten_p2",
            "kindergarten_p3",
            "kindergarten_p4",
            "kindergarten_p5",
            "primary_1",
            "primary_2",
            "primary_3",
            "primary_4",
            "primary_5",
            "primary_6",
            "eso_1",
            "eso_2",
            "eso_3",
            "eso_4",
            "baccalaureate_1",
            "baccalaureate_2",
            "FP_lower",
            "FP_higher",
            "undergraduate",
            "master",
            "phd",
            "other",
        )
        return value

    @validates("country_of_origin")
    def cleaner2(self, key, value):
        return value.upper().strip() if value else value

    def __repr__(self):
        return "<Person - %s | %s>" % (type(self).__name__, self.id)
