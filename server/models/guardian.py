from server import db
from server.auth_auth.new_needs import GuardiansNeed
from server.models.person import Person
from sqlalchemy.orm import validates

db.Table(
    "student_guardian",
    db.Column("student_id", db.Text, db.ForeignKey("student.id")),
    db.Column("guardian_id", db.Text, db.ForeignKey("guardian.id")),
)


class Guardian(Person):
    __tablename__ = "guardian"
    __mapper_args__ = {"polymorphic_identity": "guardian"}
    permissions = {GuardiansNeed}

    id = db.Column(db.Text, db.ForeignKey("person.id"), primary_key=True)
    relation = db.Column(db.Text, nullable=True)

    students = db.relationship(
        "Student", secondary="student_guardian", back_populates="guardians"
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
