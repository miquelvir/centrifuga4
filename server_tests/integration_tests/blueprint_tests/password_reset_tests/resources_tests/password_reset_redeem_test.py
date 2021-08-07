import contextlib
from unittest.mock import Mock

import server
from server.blueprints.password_reset.services.password_reset_service import (
    PasswordResetService,
)
from server.containers import Container
from server.services.recaptcha_service import RecaptchaService
import unittest

from server.models import Student, User
from server_tests.database_test_utils import WithDatabase
from server_tests.mothers.user_mother import UserMother

PASSWORD_RESET_REDEEM_URL = "/password-reset/v1/redeem"


class TestPreEnrolmentPost(WithDatabase):
    def setUp(self) -> None:
        super().setUp()

        self.sample_email = "noreply@xamfra.net"
        self.sample_user = UserMother.simple(email=self.sample_email)

        with self.app.app_context():
            sample_user = self.sample_user
            server.db.session.add(sample_user)
            server.db.session.commit()

        self.recaptcha_service_mock = Mock(spec=RecaptchaService)
        self.recaptcha_service_mock.validate.return_value = True

        self.password_reset_service = Container.password_reset_service()
        self.password_reset_service.trigger_event_user_password_reset_request = Mock()
        self.password_reset_service.trigger_event_user_password_reset_redeem = Mock()

    @contextlib.contextmanager
    def override_external_services(self):
        """ shortcut for overriding the recaptcha service AND the pre-enrolment service with the mocks"""
        with self.app.container.recaptcha_service.override(
            self.recaptcha_service_mock
        ) as ctx1:
            with self.app.container.password_reset_service.override(
                self.password_reset_service
            ) as ctx2:
                yield ctx1, ctx2

    def _post_password_reset_redeem(self, token: str, password, recaptcha=""):
        with self.override_external_services():
            return self.client.post(
                PASSWORD_RESET_REDEEM_URL,
                json={
                    "token": token,
                    "recaptcha": recaptcha,
                    "password": password,
                },
            )

    @staticmethod
    def _get_stored_user():
        return User.query.first()

    def test_stores_new_password(self):
        # Arrange
        expected_status_code = 200
        with self.app.app_context():
            user = self._get_stored_user()
            password_reset_token = self.password_reset_service.generate_token(user)
        new_password = "The&%Password-21"

        # Act
        r = self._post_password_reset_redeem(password_reset_token, new_password)

        # Assert
        self.assertEqual(expected_status_code, r.status_code)

        with self.app.app_context():
            user = self._get_stored_user()
            self.assertTrue(user.login(new_password))


if __name__ == "__main__":
    unittest.main()
