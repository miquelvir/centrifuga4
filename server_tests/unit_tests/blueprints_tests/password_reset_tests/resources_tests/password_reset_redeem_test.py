import json
from unittest.mock import Mock

from flask.wrappers import Response
from werkzeug.exceptions import BadRequest, InternalServerError, Unauthorized
import unittest

from server.blueprints.password_reset.services.password_reset_service import (
    PasswordResetService,
)
from server_tests.unit_tests.blueprints_tests.password_reset_tests.resources_tests.base_test_class import (
    TestPasswordResetPost,
)

PASSWORD_RESET_REDEEM_URL = "/password-reset/v1/redeem"


class TestPreEnrolmentPost(TestPasswordResetPost):
    def setUp(self):
        super().setUp()
        self.sample_password = "the-&54New_PASSWORD"
        self.password_reset_service_mock._update_user_password = Mock()

    def _recaptcha_and_others(
        self, no_password: bool = False, no_token: bool = False
    ) -> dict:
        """ :returns a sample request json with a sample recaptcha token and a sample body (pre-enrolment data) """
        result = self._only_recaptcha()

        if not no_token:
            with self.app.app_context():
                token = (
                    PasswordResetService()
                    .generate_token(self.sample_user)
                    .decode("UTF-8")
                )
            result["token"] = token

        if not no_password:
            result["password"] = self.sample_password

        return result

    def test_raises_bad_request_if_no_json(self):
        # Arrange
        # Act
        r = self.client.post(PASSWORD_RESET_REDEEM_URL, json=None)

        # Assert
        self.assertEqual(r.status_code, 400)
        self.assertEqual(
            json.loads(r.get_data(as_text=True))["message"], "no json found"
        )

    def test_calls_validates_recaptcha(self):
        # Arrange

        # Act
        with self.override_recaptcha_service():
            self.client.post(PASSWORD_RESET_REDEEM_URL, json=self._only_recaptcha())

        # Assert
        self.recaptcha_service_mock.validate.assert_called_with(self.sample_recaptcha)

    def test_bad_request_if_validates_fails_invalid_token(self):
        # Arrange
        self.recaptcha_service_mock.validate.side_effect = BadRequest()

        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._only_recaptcha()
            )

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_bad_request_if_validates_fails_recaptcha_error(self):
        # Arrange
        self.recaptcha_service_mock.validate.side_effect = InternalServerError()

        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._only_recaptcha()
            )

        # Assert
        self.assertEqual(r.status_code, 500)

    def test_bad_request_if_no_password(self):
        # Arrange
        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL,
                json=self._recaptcha_and_others(no_password=True),
            )

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_unauthorised_if_no_token(self):
        # Arrange
        # Act
        with self.override_recaptcha_service():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL,
                json=self._recaptcha_and_others(no_token=True),
            )

        # Assert
        self.assertEqual(r.status_code, 401)

    def test_bad_request_if_weak_password(self):
        # Arrange
        self.password_reset_service_mock.update_user_password.side_effect = BadRequest()

        # Act
        with self.override_all():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_calls_get_user_from_email(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.password_reset_service_mock.get_user_from_email.assert_called_with(
            self.sample_email
        )

    def test_bad_request_when_no_user_for_email(self):
        # Arrange
        self.password_reset_service_mock.get_user_from_email.side_effect = KeyError()

        # Act
        with self.override_all():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.assertEqual(r.status_code, 400)

    def test_unauthorized_when_try_decode_token_fails(self):
        # Arrange
        self.password_reset_service_mock.try_decode_token.side_effect = Unauthorized()

        # Act
        with self.override_all():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.assertEqual(r.status_code, 401)

    def test_calls_update_user_password_with_new_password(self):
        # Arrange
        # Act
        with self.override_all():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.password_reset_service_mock.update_user_password.validate.called_with(
            self.sample_user, self.sample_password
        )
        self.assertEqual(r.status_code, 200)

    def test_success_if_decode_succeeds(self):
        # Arrange
        # Act
        with self.override_all():
            r: Response = self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.assertEqual(r.status_code, 200)

    def test_calls_trigger_event_user_password_reset_redeem_if_success(self):
        # Arrange
        # Act
        with self.override_all():
            self.client.post(
                PASSWORD_RESET_REDEEM_URL, json=self._recaptcha_and_others()
            )

        # Assert
        self.password_reset_service_mock.trigger_event_user_password_reset_redeem.assert_called_with(
            self.sample_user
        )


if __name__ == "__main__":
    unittest.main()
