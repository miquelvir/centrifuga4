from sqlalchemy import case
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates, column_property

from centrifuga4 import db
from centrifuga4.models._base import MyBase
import datetime

from centrifuga4.models.raw_person import RawPerson


class Person(RawPerson):
    __tablename__ = "person"
    __mapper_args__ = {"polymorphic_identity": "person"}

    id = db.Column(db.Text, db.ForeignKey("raw_person.id"), primary_key=True)
    country_of_origin = db.Column(db.Text, nullable=True)

    is_studying = db.Column(db.Boolean, nullable=False)
    education_year = db.Column(db.Text, nullable=True)
    education_entity = db.Column(db.Text, nullable=True)

    is_working = db.Column(db.Boolean, nullable=False)
    career = db.Column(db.Text, nullable=True)

    # todo full_name no accents with collate https://docs.sqlalchemy.org/en/13/core/sqlelement.html#sqlalchemy.sql.expression.collate

    @hybrid_property
    def age(self):
        if not self.birth_date:
            return None
        time_difference = datetime.date.today() - self.birth_date
        return int(time_difference.days / 365.25)

    @hybrid_property
    def is_underage(self):
        return self.age < 18

    @hybrid_property
    def is_overage(self):
        return not self.is_underage

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
