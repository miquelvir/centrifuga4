import contextlib
import json

from server.blueprints.pre_enrolment.services.pre_enrolment_service import PreEnrolmentService
from unittest.mock import Mock
import unittest

from server_tests.database_test_utils import WithApp
from server_tests.mothers.course_mother import CourseMother

PRE_ENROLMENT_URL = '/pre-enrolment/v1/courses'


class TestPreEnrolmentPost(WithApp):
    def setUp(self):
        super().setUp()

        self.courses = [CourseMother.published(id_="1"),
                        CourseMother.published(id_="2"),
                        CourseMother.published(id_="3")]

        self.pre_enrolment_service_mock = Mock(spec=PreEnrolmentService)
        self.pre_enrolment_service_mock.get_published_courses.return_value = self.courses

    @contextlib.contextmanager
    def override_pre_enrolment_service(self):
        """ shortcut for overriding the pre enrolment service with the mock """
        with self.app.container.pre_enrolment_service.override(self.pre_enrolment_service_mock) as ctx:
            yield ctx

    def test_returns_empty_list_if_no_courses(self):
        # Arrange
        self.pre_enrolment_service_mock.get_published_courses.return_value = []
        expected_result = []

        # Act
        with self.override_pre_enrolment_service():
            r = self.client.get(PRE_ENROLMENT_URL, json=None)

        # Assert
        self.assertEqual(r.status_code, 200)
        self.assertEqual(json.loads(r.get_data(as_text=True)), expected_result)

    def test_returns_courses(self):
        # Arrange
        expected_count = len(self.courses)
        expected_ids = [c.id for c in self.courses]

        # Act
        with self.override_pre_enrolment_service():
            r = self.client.get(PRE_ENROLMENT_URL, json=None)

        # Assert
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(json.loads(r.get_data(as_text=True))), expected_count)
        self.assertEqual([c["id"] for c in json.loads(r.get_data(as_text=True))], expected_ids)

    def test_not_returns_private_fields(self):
        # Arrange
        # Act
        with self.override_pre_enrolment_service():
            r = self.client.get(PRE_ENROLMENT_URL, json=None)

        # Assert
        for course in json.loads(r.get_data(as_text=True)):
            self.assertNotIn("price_term", course)
            self.assertNotIn("is_published", course)
            self.assertNotIn("rooms", course)
            self.assertNotIn("teachers", course)
            self.assertNotIn("students", course)
            self.assertNotIn("schedules", course)
            self.assertNotIn("calendar_id", course)
            self.assertNotIn("attendances", course)
            self.assertNotIn("calendar_url", course)

    def test_only_public_fields_are_returned(self):
        # Arrange
        expected_attributes_count = 5

        # Act
        with self.override_pre_enrolment_service():
            r = self.client.get(PRE_ENROLMENT_URL, json=None)

        # Assert
        for course in json.loads(r.get_data(as_text=True)):
            self.assertEqual(expected_attributes_count, len(course))
            self.assertIn("base_schedules", course)
            self.assertIn("description", course)
            self.assertIn("id", course)
            self.assertIn("labels", course)
            self.assertIn("name", course)


if __name__ == "__main__":
    unittest.main()
