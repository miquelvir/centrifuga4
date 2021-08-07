import contextlib
import json
from server.blueprints.password_reset.services.password_reset_service import (
    PasswordResetService,
)
from server.models import Student
from unittest.mock import Mock
from flask.wrappers import Response
from werkzeug.exceptions import BadRequest, InternalServerError
from server.services.recaptcha_service import RecaptchaService
import unittest

from server_tests.database_test_utils import WithApp
from server_tests.mothers.user_mother import UserMother


class TestPasswordResetPost(WithApp):
    def setUp(self):
        super().setUp()

        self.sample_recaptcha = "a-token"
        self.sample_email = "noreply@xamfra.net"
        self.sample_user = UserMother.simple(email=self.sample_email)
        self.sample_jwt = "a-jwt"

        self.recaptcha_service_mock = Mock(spec=RecaptchaService)
        self.recaptcha_service_mock.validate.return_value = True

        self.password_reset_service_mock = Mock(spec=PasswordResetService)
        self.password_reset_service_mock.trigger_event_user_password_reset_request = (
            Mock()
        )
        self.password_reset_service_mock.trigger_event_user_password_reset_redeem = (
            Mock()
        )
        self.password_reset_service_mock.get_user_from_email.return_value = (
            self.sample_user
        )
        self.password_reset_service_mock.generate_token.return_value = self.sample_jwt

    @contextlib.contextmanager
    def override_recaptcha_service(self):
        """ shortcut for overriding the recaptcha service with the mock """
        with self.app.container.recaptcha_service.override(
            self.recaptcha_service_mock
        ) as ctx:
            yield ctx

    @contextlib.contextmanager
    def override_all(self):
        """ shortcut for overriding the recaptcha service AND the pre-enrolment service with the mocks"""
        with self.override_recaptcha_service() as ctx1:
            with self.app.container.password_reset_service.override(
                self.password_reset_service_mock
            ) as ctx2:
                yield ctx1, ctx2

    def _only_recaptcha(self) -> dict:
        """ :returns a sample request json with a sample recaptcha token """
        return {"recaptcha": self.sample_recaptcha}
