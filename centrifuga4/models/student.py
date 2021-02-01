import datetime
from typing import Set

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from centrifuga4 import db
from centrifuga4.auth_auth.resource_need import StudentsPermission
from centrifuga4.models.person import Person


class Student(Person):
    __tablename__ = "student"
    __mapper_args__ = {"polymorphic_identity": "student"}
    permissions = {StudentsPermission}

    id = db.Column(db.Text, db.ForeignKey("person.id"), primary_key=True)

    price_term = db.Column(db.Float, nullable=True)
    years_in_xamfra = db.Column(db.Integer, nullable=True)
    default_payment_method = db.Column(db.Text, nullable=True)
    payment_comments = db.Column(db.Text, nullable=True)
    other_comments = db.Column(db.Text, nullable=True)
    image_agreement = db.Column(db.Boolean, nullable=False, default=False)
    birth_date = db.Column(db.Date, nullable=True)

    enrolment_status = db.Column(db.Text, nullable=False)
    early_unenrolment_date = db.Column(db.Date, nullable=True)
    enrolment_date = db.Column(db.Date, nullable=True)
    pre_enrolment_date = db.Column(db.Date, default=datetime.datetime.utcnow)

    courses = db.relationship(
        "Course", secondary="student_course", back_populates="students"
    )
    payments = db.relationship("Payment", back_populates="student")
    guardians = db.relationship(
        "Guardian", secondary="student_guardian", back_populates="students"
    )

    @hybrid_property
    def official_notification_emails(self) -> Set[str]:
        emails = set()
        for guardian in self.guardians:
            if guardian.email:
                emails.add(guardian.email)

        if self.is_overage or len(emails) == 0:
            if self.email:
                emails.add(self.email)

        return emails

    @hybrid_property
    def is_enrolled(self) -> bool:
        return self.enrolment_status == "enrolled"

    @validates("enrolment_status")
    def cleaner2(self, key, value):
        assert value in (
            "enrolled",
            "early-unenrolled",
            "pre-enrolled",
        ), "status must be either 'enrolled', 'early-unenrolled', 'pre-enrolled'"

        if self.enrolment_status != "enrolled" and value == "enrolled":
            self.enrolment_date = datetime.date.today()

        if self.enrolment_status != "early-unenrolled" and value == "early-unenrolled":
            self.early_unenrolment_date = datetime.date.today()

        return value

    @hybrid_property
    def schedules(self):
        if self.courses:
            for course in self.courses:
                for schedule in course.schedules:
                    if schedule.is_base or self.id == schedule.student_id:
                        yield schedule
        else:
            return []

    @validates("default_payment_method")
    def cleaner1(self, key, value):
        assert value in (None, "bank-direct-debit", "cash", "bank-transfer"), (
            "method must be either cash or bank-transfer, found %s" % value
        )
        return value

    def get_course_schedules(self):  # todo refractor
        def to_literal(n):
            if n == 0:
                return "DG. / DO / SUN"
            elif n == 1:
                return "DL. / LU / MON"
            elif n == 2:
                return "DT. / MA / TUE"
            elif n == 3:
                return "DC. / MI / WED"
            elif n == 4:
                return "DJ. / JU / THU"
            elif n == 5:
                return "DV. / VI / FRI"
            elif n == 6:
                return "DS. / SA / SAT"
            else:
                return "-"

        result = {}
        for course in self.courses:
            current = []
            for schedule in course.schedules:
                if self.id == schedule.student_id or schedule.is_base:
                    current.append(
                        "%s, %s - %s (%s)"
                        % (
                            to_literal(schedule.day_week),
                            schedule.start_time,
                            schedule.end_time,
                            ", ".join(
                                [
                                    r.name if r.name else "Xamfrà"
                                    for r in schedule.course.rooms
                                ]
                            )
                            if len(schedule.course.rooms) > 0
                            else "Xamfrà",
                        )
                    )
            result[course.id] = current
        return result
