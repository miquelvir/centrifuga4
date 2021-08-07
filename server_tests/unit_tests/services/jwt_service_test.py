from unittest.mock import Mock


from requests import Response
from werkzeug.exceptions import BadRequest, InternalServerError

from server.services.jwt_service import JwtService
from server.services.recaptcha_service import RecaptchaService
import unittest

from server_tests.database_test_utils import WithApp


class TestJwtService(WithApp):
    def setUp(self):
        super().setUp()
        self.sut = JwtService()
        self.sample_data = {"some-data": "is-nice", "other": "is-not"}

    def test_no_data_loss_after_encodes_decodes(self):
        # Arrange
        # Act
        with self.app.app_context():
            token = self.sut.encode(self.sample_data)
            recovered_data = self.sut.decode(token)

        # Assert
        self.assertEqual(self.sample_data, recovered_data)

    def test_uses_app_secret(self):
        # Arrange
        with self.app.app_context():
            from flask import current_app

            secret = current_app.config["SECRET_KEY"]
            expected_token = self.sut.encode(self.sample_data, secret=secret)

            # Act
            token = self.sut.encode(self.sample_data)

        # Assert
        self.assertEqual(expected_token, token)

    def test_is_valid_if_correctly_signed(self):
        # Arrange
        # Act
        with self.app.app_context():
            is_valid = self.sut.is_valid(self.sut.encode({}))

        # Assert
        self.assertTrue(is_valid)

    def _test_is_invalid(self, invalid_token):
        # Arrange
        # Act
        with self.app.app_context():
            is_valid, _ = self.sut.is_valid(invalid_token)

        # Assert
        self.assertFalse(is_valid)

    def test_is_invalid_if_badly_formatted(self):
        self._test_is_invalid("an invalid token")

    def test_is_invalid_if_bad_signature(self):
        self._test_is_invalid(self.sut.encode({}, secret="not-the-correct-secret"))


if __name__ == "__main__":
    unittest.main()
