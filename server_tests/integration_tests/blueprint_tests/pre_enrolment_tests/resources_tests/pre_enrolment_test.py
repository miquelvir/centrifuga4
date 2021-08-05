import contextlib
import copy
import datetime
from unittest.mock import Mock
from server.models.student import EnrolmentStatus
from server.recaptcha_service import RecaptchaService
import unittest
from parameterized import parameterized

from server import db
from server.blueprints.pre_enrolment.services.pre_enrolment_service import (
    PreEnrolmentService,
)
from server.models import Student, Course, Guardian
from server_tests.database_test_utils import WithDatabase
from server_tests.mothers.course_mother import CourseJsonMother
from server_tests.mothers.pre_enrolment_mother import PreEnrolmentMother

PRE_ENROLMENT_URL = "/pre-enrolment/v1/pre-enrolment"


def add_sample_courses(courses):
    for course_id in courses:
        course = Course(
            id=course_id,
            name="course name",
            description="a description",
            is_published=True,
            calendar_id="sample_calendar_id",
        )
        db.session.add(course)
    db.session.commit()


class TestPreEnrolmentPost(WithDatabase):
    def setUp(self) -> None:
        super().setUp()

        with self.app.app_context():
            add_sample_courses(CourseJsonMother.three_ids())

        self.recaptcha_service_mock = Mock(spec=RecaptchaService)
        self.recaptcha_service_mock.validate.return_value = True

        self.pre_enrolment_service = PreEnrolmentService()
        self.pre_enrolment_service.trigger_event_student_pre_enrolled = Mock()

    @contextlib.contextmanager
    def override_external_services(self):
        """ shortcut for overriding the recaptcha service AND the pre-enrolment service with the mocks"""
        with self.app.container.recaptcha_service.override(
            self.recaptcha_service_mock
        ) as ctx1:
            with self.app.container.pre_enrolment_service.override(
                self.pre_enrolment_service
            ) as ctx2:
                yield ctx1, ctx2

    def _post_pre_enrolment(self, data):
        with self.override_external_services():
            return self.client.post(PRE_ENROLMENT_URL, json=data)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_student_is_stored(self, post_data):
        # Arrange
        expected_status_code = 200
        expected_student_count = 1

        # Act
        r = self._post_pre_enrolment(post_data)

        # Assert
        self.assertEqual(expected_status_code, r.status_code)

        with self.app.app_context():
            students = Student.query.all()
            student_count = len(students)

        self.assertEqual(expected_student_count, student_count)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_has_courses(self, post_data):
        # Arrange
        chosen_courses = post_data["body"]["courses"]
        expected_courses_count = len(chosen_courses)

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        with self.app.app_context():
            student = Student.query.first()
            courses = student.courses
            courses_count = len(courses)
            courses_ids = [course.id for course in courses]

        self.assertEqual(expected_courses_count, courses_count)
        self.assertListEqual(chosen_courses, courses_ids)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_has_guardians(self, post_data):
        # Arrange
        expected_guardians_count = len(post_data["body"]["guardians"])

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        with self.app.app_context():
            guardians = Guardian.query.all()
            self.assertEqual(expected_guardians_count, len(guardians))

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_has_name_saved(self, post_data):
        # Arrange
        expected_name = post_data["body"]["name"]
        expected_surname1 = post_data["body"]["surname1"]
        expected_surname2 = post_data["body"]["surname2"]

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        student = self._first_student_from_db()
        self.assertEqual(expected_name, student.name)
        self.assertEqual(expected_surname1, student.surname1)
        self.assertEqual(expected_surname2, student.surname2)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_has_name_cleaned(self, post_data):
        # Arrange
        expected_name = post_data["body"]["name"]
        expected_surname1 = post_data["body"]["surname1"]
        expected_surname2 = post_data["body"]["surname2"]

        # uppercase, and leading and trailing spaces should be cleaned
        data = copy.deepcopy(post_data)
        data["body"]["name"] = " " + expected_name.upper() + "    "
        data["body"]["surname1"] = "    " + expected_surname1.upper() + " "
        data["body"]["surname2"] = "  " + expected_surname2.upper() + "  "

        # Act
        self._post_pre_enrolment(data)

        # Assert
        student = self._first_student_from_db()
        self.assertEqual(expected_name, student.name)
        self.assertEqual(expected_surname1, student.surname1)
        self.assertEqual(expected_surname2, student.surname2)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_status_is_pre_enrolled(self, post_data):
        # Arrange
        expected_status = EnrolmentStatus.pre_enrolled

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        student = self._first_student_from_db()
        status = student.enrolment_status

        self.assertEqual(expected_status, status)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_pre_enrolment_date_is_today(self, post_data):
        # Arrange
        expected_pre_enrolment_date = datetime.datetime.now().date()

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        student = self._first_student_from_db()
        pre_enrolment_date = student.pre_enrolment_date

        self.assertEqual(expected_pre_enrolment_date, pre_enrolment_date)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_enrolment_date_is_none(self, post_data):
        # Arrange
        expected_enrolment_date = None

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        student = self._first_student_from_db()
        enrolment_date = student.enrolment_date

        self.assertEqual(expected_enrolment_date, enrolment_date)

    @parameterized.expand(
        [(PreEnrolmentMother.adult_anna(),), (PreEnrolmentMother.child_mark(),)]
    )
    def test_early_un_enrolment_date_is_none(self, post_data):
        # Arrange
        expected_early_un_enrolment_date = None

        # Act
        self._post_pre_enrolment(post_data)

        # Assert
        student = self._first_student_from_db()
        early_un_enrolment_date = student.early_unenrolment_date

        self.assertEqual(expected_early_un_enrolment_date, early_un_enrolment_date)

    def _first_student_from_db(self):
        with self.app.app_context():
            return Student.query.first()


if __name__ == "__main__":
    unittest.main()
