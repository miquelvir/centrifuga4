from server.models import Student
from server.models.student import EnrolmentStatus
from server_tests.mothers.course_mother import CourseJsonMother
from server_tests.mothers.person_mother import JsonPersonMother


class StudentMother:
    @staticmethod
    def simple() -> Student:
        return Student(
            id="1",
            is_studying=False,
            is_working=False,
            name="name",
            surname1="surname1",
            surname2="surname2",
            enrolment_status=EnrolmentStatus.pre_enrolled,
        )


class StudentJsonMother:
    @staticmethod
    def adult_anna() -> dict:
        return {
            **JsonPersonMother.adult_anna(),
            "image_agreement": True,
            "image_agreement_external": True,
            "country_of_origin": "ES",
            "gender": "m",
            "birth_date": "2001-01-01",
            "years_in_xamfra": 5,
            "guardians": [],
            "payment_comments": "Puc pagar la quota trimestral de 70€/estudiant",
            "price_term": 70,
            "other_comments": "this is a comment",
            "courses": list(CourseJsonMother.three_ids()[0:1]),
        }

    @classmethod
    def child_mark(cls) -> dict:
        return {
            **JsonPersonMother.child_mark(),
            "image_agreement": True,
            "image_agreement_external": True,
            "country_of_origin": "ES",
            "gender": "m",
            "birth_date": "2005-05-05",
            "years_in_xamfra": 5,
            "guardians": [JsonPersonMother.adult_anna()],
            "payment_comments": "Puc pagar la quota trimestral de 70€/estudiant",
            "price_term": 70,
            "other_comments": "this is a comment",
            "courses": list(CourseJsonMother.three_ids()[0:1]),
        }
