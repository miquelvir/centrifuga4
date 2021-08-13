import datetime
from typing import Set

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from server import db
from server.auth_auth.new_needs import StudentsNeed
from server.models.person import Person
import abc


class EnrolmentStatus(abc.ABC):
    enrolled = "enrolled"
    pre_enrolled = "pre-enrolled"
    early_unenrolled = "early-unenrolled"

    any_ = (enrolled, pre_enrolled, early_unenrolled)


class Student(Person):
    __tablename__ = "student"
    __mapper_args__ = {"polymorphic_identity": "student"}
    permissions = {StudentsNeed}

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
    pre_enrolment_date = db.Column(db.Date, default=datetime.datetime.now)

    courses = db.relationship(
        "Course", secondary="student_course", back_populates="students"
    )
    payments = db.relationship("Payment", back_populates="student")
    attendances = db.relationship(
        "Attendance", back_populates="student", cascade="all, delete-orphan"
    )
    guardians = db.relationship(
        "Guardian", secondary="student_guardian", back_populates="students"
    )

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

    @hybrid_property
    def annual_price(self):
        return self.price_term * 3 if self.price_term else None

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
    def all_emails(self) -> Set[str]:
        emails = self.contact_emails
        emails.add(self.email)
        return emails

    @hybrid_property
    def contact_emails(self) -> Set[str]:
        emails = set()
        for guardian in self.guardians:
            emails.add(guardian.email)
        return emails

    @hybrid_property
    def is_enrolled(self) -> bool:
        return self.enrolment_status == "enrolled"

    @validates("enrolment_status")
    def cleaner2(self, key, value):
        assert (
            value in EnrolmentStatus.any_
        ), f"status must be one of {EnrolmentStatus.any_}"

        # if status is changing to enrolled or early-unenrolled, update the enrolment / early-unenrolment date
        if (
            self.enrolment_status != EnrolmentStatus.enrolled
            and value == EnrolmentStatus.enrolled
        ):
            self.enrolment_date = datetime.date.today()

        if (
            self.enrolment_status != EnrolmentStatus.early_unenrolled
            and value == EnrolmentStatus.early_unenrolled
        ):
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
