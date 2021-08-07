from unittest.mock import Mock

from requests import Response
from werkzeug.exceptions import BadRequest, InternalServerError
from server.services.recaptcha_service import RecaptchaService
import unittest


class TestRecaptchaService(unittest.TestCase):
    @staticmethod
    def _error_response():
        response = Mock(spec=Response, ok=False)
        return response

    @staticmethod
    def _failed_response():
        response = Mock(spec=Response, ok=True)
        response.json = Mock(return_value={"success": False})
        return response

    @staticmethod
    def _success_response():
        response = Mock(spec=Response, ok=True)
        response.json = Mock(return_value={"success": True})
        return response

    def setUp(self):
        self.sut = RecaptchaService()
        self.token = ""

    def test_raises_bad_request_if_no_token(self):
        # Arrange
        self.token = None
        expected_error_message = "missing recaptcha token (response)"

        # Act
        # Assert
        with self.assertRaises(BadRequest) as ctx:
            self.sut.validate(self.token)
        self.assertEqual(expected_error_message, ctx.exception.description)

    def test_raises_internal_server_error_if_api_request_fails(self):
        # Arrange
        self.sut._post_to_recaptcha_api = Mock(return_value=self._error_response())
        expected_error_message = "error in google siteverify api"
        # Act
        # Assert
        with self.assertRaises(InternalServerError) as ctx:
            self.sut.validate(self.token)
        self.assertEqual(expected_error_message, ctx.exception.description)

    def test_raises_bad_request_if_fails_captcha(self):
        # Arrange
        self.sut._post_to_recaptcha_api = Mock(return_value=self._failed_response())
        expected_error_message = "you are a robot"
        # Act
        # Assert
        with self.assertRaises(BadRequest) as ctx:
            self.sut.validate(self.token)
        self.assertEqual(expected_error_message, ctx.exception.description)

    def test_returns_true_if_success(self):
        # Arrange
        self.sut._post_to_recaptcha_api = Mock(return_value=self._success_response())
        expected_success = True

        # Act
        success = self.sut.validate(self.token)

        # Assert
        self.assertEqual(expected_success, success)


if __name__ == "__main__":
    unittest.main()
