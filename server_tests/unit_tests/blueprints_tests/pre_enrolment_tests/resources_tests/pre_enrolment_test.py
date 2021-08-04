import contextlib
import json
from server import init_app
from config import TestingConfigNoDb
from server.blueprints.pre_enrolment.services.pre_enrolment_service import PreEnrolmentService
from server.models import Student
from unittest.mock import Mock
from flask.wrappers import Response
from werkzeug.exceptions import BadRequest, InternalServerError
from server.recaptcha_service import RecaptchaService
import unittest


PRE_ENROLMENT_URL = '/pre-enrolment/v1/pre-enrolment'


class TestPreEnrolmentPost(unittest.TestCase):
    def setUp(self):
        self.app = init_app(TestingConfigNoDb)
        self.client = self.app.test_client()

        self.sample_recaptcha = "a-token"
        self.sample_body = {"sample": "body"}  # actual validation/parsing is not tested in this unit
        self.sample_student = Student()

        self.recaptcha_service_mock = Mock(spec=RecaptchaService)
        self.recaptcha_service_mock.validate.return_value = True

        self.pre_enrolment_service_mock = Mock(spec=PreEnrolmentService)
        self.pre_enrolment_service_mock.parse_student.return_value = self.sample_student

    @contextlib.contextmanager
    def override_recaptcha_service(self):
        """ shortcut for overriding the recaptcha service with the mock """
        with self.app.container.recaptcha_service.override(self.recaptcha_service_mock) as ctx:
            yield ctx

    @contextlib.contextmanager
    def override_all(self):
        """ shortcut for overriding the recaptcha service AND the pre-enrolment service with the mocks"""
        with self.override_recaptcha_service() as ctx1:
            with self.app.container.pre_enrolment_service.override(self.pre_enrolment_service_mock) as ctx2:
                yield ctx1, ctx2

    def _only_recaptcha(self) -> dict:
        """ :returns a sample request json with a sample recaptcha token """
        return {"recaptcha": self.sample_recaptcha}

    def _recaptcha_and_body(self) -> dict:
        """ :returns a sample request json with a sample recaptcha token and a sample body (pre-enrolment data) """
        return {**self._only_recaptcha(), "body": self.sample_body}

    def test_raises_bad_request_if_no_json(self):
        # Arrange
        # Act
        r = self.client.post(PRE_ENROLMENT_URL, json=None)

        # Assert
        self.assertEqual(r.status_code, 400)
        self.assertEqual(json.loads(r.get_data(as_text=True))["message"], "no json found")

    def test_calls_recaptcha_with_token(self):
        # Arrange
        # Act
        with self.override_recaptcha_service():
            self.client.post(PRE_ENROLMENT_URL, json=self._only_recaptcha())

        # Assert
        self.recaptcha_service_mock.validate.assert_called_with(self.sample_recaptcha)

    def test_calls_validates_token(self):
        # Arrange

        # Act
        with self.override_recaptcha_service():
            self.client.post(PRE_ENROLMENT_URL, json=self._only_recaptcha())

        # Assert
        self.recaptcha_service_mock.validate.assert_called_with(self.sample_recaptcha)

    def test_bad_request_if_validates_fails_invalid_token(self):
        # Arrange
        self.recaptcha_service_mock.validate.side_effect = BadRequest()

        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(PRE_ENROLMENT_URL, json=self._only_recaptcha())

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_bad_request_if_validates_fails_recaptcha_error(self):
        # Arrange
        self.recaptcha_service_mock.validate.side_effect = InternalServerError()

        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(PRE_ENROLMENT_URL, json=self._only_recaptcha())

        # Assert
        self.assertEqual(r.status_code, 500)

    def test_calls_parse_student(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(PRE_ENROLMENT_URL, json=self._recaptcha_and_body())

        # Assert
        self.pre_enrolment_service_mock.parse_student.assert_called_with(self.sample_body)

    def test_bad_request_if_no_body(self):
        # Arrange
        self.pre_enrolment_service_mock.parse_student.side_effect = BadRequest

        # Act
        with self.override_all():
            r: Response = self.client.post(PRE_ENROLMENT_URL, json=self._only_recaptcha())

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_calls_save_student_if_valid_parsing(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(PRE_ENROLMENT_URL, json=self._recaptcha_and_body())

        # Assert
        self.pre_enrolment_service_mock.save_student.assert_called_with(self.sample_student)

    def test_calls_trigger_event_if_valid_student(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(PRE_ENROLMENT_URL, json=self._recaptcha_and_body())

        # Assert
        self.pre_enrolment_service_mock.trigger_event_student_pre_enrolled.assert_called_with(self.sample_student)


if __name__ == "__main__":
    unittest.main()
