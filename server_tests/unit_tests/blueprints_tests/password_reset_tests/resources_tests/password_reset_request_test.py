import contextlib
import json
from server.blueprints.password_reset.services.password_reset_service import PasswordResetService
from unittest.mock import Mock
from flask.wrappers import Response
from werkzeug.exceptions import BadRequest, InternalServerError
from server.recaptcha_service import RecaptchaService
import unittest
from server_tests.mothers.user_mother import UserMother
from server_tests.unit_tests.blueprints_tests.password_reset_tests.resources_tests.base_test_class import \
    TestPasswordResetPost

PASSWORD_RESET_REQUEST_URL = '/password-reset/v1/request'


class TestPasswordResetRequestPost(TestPasswordResetPost):
    def _recaptcha_and_email(self) -> dict:
        """ :returns a sample request json with a sample recaptcha token and a sample body (pre-enrolment data) """
        return {**self._only_recaptcha(), "email": self.sample_email}

    def test_raises_bad_request_if_no_json(self):
        # Arrange
        # Act
        r = self.client.post(PASSWORD_RESET_REQUEST_URL, json=None)

        # Assert
        self.assertEqual(r.status_code, 400)
        self.assertEqual(json.loads(r.get_data(as_text=True))["message"], "no json found")

    def test_calls_recaptcha_with_token(self):
        # Arrange
        # Act
        with self.override_recaptcha_service():
            self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._only_recaptcha())

        # Assert
        self.recaptcha_service_mock.validate.assert_called_with(self.sample_recaptcha)

    def test_bad_request_if_validates_fails_invalid_token(self):
        # Arrange
        self.recaptcha_service_mock.validate.side_effect = BadRequest()

        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._only_recaptcha())

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_bad_request_if_validates_fails_recaptcha_error(self):
        # Arrange
        self.recaptcha_service_mock.validate.side_effect = InternalServerError()

        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._only_recaptcha())

        # Assert
        self.assertEqual(r.status_code, 500)

    def test_calls_get_user(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._recaptcha_and_email())

        # Assert
        self.password_reset_service_mock.get_user_from_email.assert_called_with(self.sample_email)

    def test_bad_request_if_no_email(self):
        # Arrange
        self.password_reset_service_mock.get_user_from_email.side_effect = BadRequest

        # Act
        with self.override_all():
            r: Response = self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._only_recaptcha())

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_calls_generate_token_if_valid_parsing(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._recaptcha_and_email())

        # Assert
        self.password_reset_service_mock.generate_token.assert_called_with(self.sample_user)

    def test_calls_trigger_event_if_valid_student(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(PASSWORD_RESET_REQUEST_URL, json=self._recaptcha_and_email())

        # Assert
        self.password_reset_service_mock.trigger_event_user_password_reset_request.assert_called_with(self.sample_user, self.sample_jwt)


if __name__ == "__main__":
    unittest.main()
