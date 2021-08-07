from parameterized import parameterized

import server
from server.models import Student, Course
from unittest.mock import Mock
from werkzeug.exceptions import BadRequest

from server.models.student import EnrolmentStatus
import unittest

from server_tests.database_test_utils import WithDatabase
from server.blueprints.pre_enrolment.services.pre_enrolment_service import (
    PreEnrolmentService,
)
from server_tests.mothers.course_mother import CourseMother
from server_tests.mothers.student_mother import StudentJsonMother, StudentMother


class TestPreEnrolmentServiceSaveToDb(WithDatabase):
    def setUp(self):
        super().setUp()

        self.sample_student = StudentMother.simple()

    def test_saves_student_to_db(self):
        # Arrange
        expected_student_count = 1

        sut = PreEnrolmentService()

        with self.app.app_context():
            # Act
            sut.save_student(self.sample_student)

            # Assert
            student_count = len(Student.query.all())

        self.assertEqual(expected_student_count, student_count)


class TestPreEnrolmentServiceCourses(WithDatabase):
    def setUp(self):
        super().setUp()
        self.sut = PreEnrolmentService()

    def test_returns_empty_list_if_no_courses(self):
        # Arrange
        expected_return_value = []

        with self.app.app_context():
            # Act
            courses = self.sut.get_published_courses()

        # Assert
        self.assertListEqual(expected_return_value, list(courses))

    def test_returns_all_published_courses(self):
        # Arrange
        expected_return_value = [
            CourseMother.published(id_="1"),
            CourseMother.published(id_="2"),
        ]
        all_courses = [*expected_return_value, CourseMother.not_published(id_="3")]
        with self.app.app_context():
            for course in all_courses:
                server.db.session.add(course)
            server.db.session.commit()

            # Act
            courses = self.sut.get_published_courses()

        # Assert
        self.assertListEqual(expected_return_value, list(courses))


class TestPreEnrolmentServiceParseStudent(unittest.TestCase):
    def setUp(self):
        self.sample_student_id = "968ec8e1-f430-4c9d-9986-bda3ad338603"

        self.sut = PreEnrolmentService()
        self.sut._generate_new_student_id = Mock(return_value=self.sample_student_id)
        self.sut._get_course = lambda id_: Course(id=id_, is_published=True)

    def test_raises_bad_request_if_no_body(self):
        # Arrange
        sample_body = None
        expected_error_message = "no body found"

        # Act
        # Assert
        with self.assertRaises(BadRequest) as ctx:
            self.sut.parse_student(sample_body)
        self.assertEqual(expected_error_message, ctx.exception.description)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_student_has_generated_id(self, sample_body):
        # Arrange
        expected_student_id = self.sample_student_id

        # Act
        student = self.sut.parse_student(sample_body)

        # Assert
        self.assertEqual(expected_student_id, student.id)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_raises_bad_request_if_no_course_found(self, sample_body):
        # Arrange
        self.sut._get_course = lambda id_: None
        first_course_id = sample_body["courses"][0]
        expected_error_message = f"no course found with id '{first_course_id}'"

        # Act
        # Assert
        with self.assertRaises(BadRequest) as ctx:
            self.sut.parse_student(sample_body)
        self.assertEqual(expected_error_message, ctx.exception.description)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_raises_bad_request_if_course_not_public(self, sample_body):
        # Arrange
        self.sut._get_course = lambda id_: Course(is_published=False)
        first_course_id = sample_body["courses"][0]
        expected_error_message = f"course '{first_course_id}' is not public"

        # Act
        # Assert
        with self.assertRaises(BadRequest) as ctx:
            self.sut.parse_student(sample_body)
        self.assertEqual(expected_error_message, ctx.exception.description)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_raises_bad_request_if_student_validation_error(self, sample_body):
        # Arrange
        del sample_body["name"]

        # Act
        # Assert
        with self.assertRaises(BadRequest):
            self.sut.parse_student(sample_body)

    @parameterized.expand(
        [
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_raises_bad_request_if_guardian_validation_error(self, sample_body):
        # Arrange
        del sample_body["guardians"][0]["name"]

        # Act
        # Assert
        with self.assertRaises(BadRequest):
            self.sut.parse_student(sample_body)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_student_enrolment_status_is_pre_enrolled(self, sample_body):
        # Arrange
        expected_student_status = EnrolmentStatus.pre_enrolled

        # Act
        student = self.sut.parse_student(sample_body)

        # Assert
        self.assertEqual(expected_student_status, student.enrolment_status)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_student_has_guardians(self, sample_body):
        # Arrange
        expected_guardians = len(sample_body["guardians"])

        # Act
        student = self.sut.parse_student(sample_body)

        # Assert
        self.assertEqual(expected_guardians, len(student.guardians))
        self.assertEqual(
            [g["id"] for g in sample_body["guardians"]],
            [g.id for g in student.guardians],
        )

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_student_has_name(self, sample_body):
        # Arrange
        expected_name = sample_body["name"]
        expected_surname1 = sample_body["surname1"]
        expected_surname2 = sample_body["surname2"]

        # Act
        student = self.sut.parse_student(sample_body)

        # Assert
        self.assertEqual(expected_name, student.name)
        self.assertEqual(expected_surname1, student.surname1)
        self.assertEqual(expected_surname2, student.surname2)

    @parameterized.expand(
        [
            (StudentJsonMother.adult_anna(),),
            (StudentJsonMother.child_mark(),),
        ]
    )
    def test_student_has_name_cleaned(self, sample_body):
        # Arrange
        expected_name = sample_body["name"]
        expected_surname1 = sample_body["surname1"]
        expected_surname2 = sample_body["surname2"]
        sample_body["name"] = "  " + sample_body["name"].upper() + "  "
        sample_body["surname1"] = "  " + sample_body["surname1"].upper() + "  "
        sample_body["surname2"] = "  " + sample_body["surname2"].upper() + "  "

        # Act
        student = self.sut.parse_student(sample_body)

        # Assert
        self.assertEqual(expected_name, student.name)
        self.assertEqual(expected_surname1, student.surname1)
        self.assertEqual(expected_surname2, student.surname2)


if __name__ == "__main__":
    unittest.main()
