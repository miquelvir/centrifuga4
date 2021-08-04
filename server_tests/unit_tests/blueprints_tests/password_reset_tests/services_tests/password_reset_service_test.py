import datetime

import jwt
from flask import current_app
from parameterized import parameterized

import server
from server.blueprints.password_reset.services.password_reset_service import PasswordResetService
from server.models import User
from unittest.mock import Mock
from werkzeug.exceptions import BadRequest, Unauthorized

import unittest

from server_tests.database_test_utils import WithDatabase, WithApp
from server_tests.mothers.user_mother import UserMother


class TestPasswordResetServiceTryDecodeToken(WithApp):  # todo refractor config out
    def setUp(self):
        super().setUp()
        self.sut = PasswordResetService()
        self.sample_password_hash = "password-hash"

    def test_raises_unauthorized_if_invalid_token(self):
        # Arrange
        token = "a-bad-token"

        # Act
        # Assert
        with self.app.app_context(), self.assertRaises(Unauthorized):
            self.sut.try_decode_token(self.sample_password_hash, token)

    def test_raises_unauthorized_if_invalid_password_hash(self):
        # Arrange
        with self.app.app_context():
            token = self.sut.generate_token(User(password_hash=self.sample_password_hash)).decode("UTF-8")

            # Act
            self.sample_password_hash += "make-it-invalid"

            # Assert
            with self.assertRaises(Unauthorized):
                self.sut.try_decode_token(self.sample_password_hash, token)


class TestPasswordResetServiceUpdatePassword(WithDatabase):
    @parameterized.expand([
        ("",),
        (None,),
        ("weak", ),
        ("123", ),
        (".......................", ),
        ("aaaaaaaaaaaaaaaaaaaaaaa", ),
        ("11111111111111111111111", )
    ])
    def test_raises_bad_request_when_weak_password_deprecated(self, new_password):  # todo out of this unit and into whatever validates passwords (rn: User)
        # Arrange
        sut = PasswordResetService()
        with self.app.app_context():
            with self.assertRaises(BadRequest):
                sut.update_user_password(UserMother.simple(), new_password)

    def test_raises_bad_request_when_weak_password(self):
        # Arrange
        sut = PasswordResetService()
        sut.is_strong_enough_password = Mock(return_value=False)
        sample_new_password = ""

        # Act
        # Assert
        with self.app.app_context():
            with self.assertRaises(BadRequest):
                sut.update_user_password(UserMother.simple(), sample_new_password)

    def test_updates_student_password_hash_in_db(self):
        # Arrange
        sut = PasswordResetService()
        new_password = "passwordPASSWORD_&%1"
        with self.app.app_context():
            sample_user = UserMother.simple(password="patata&%1")
            server.db.session.add(sample_user)
            server.db.session.commit()

            # Act
            sut.update_user_password(sample_user, new_password)

            # Assert
            user = User.query.filter_by(id=sample_user.id).first()
            self.assertTrue(user.login(new_password))


class TestPasswordResetServiceGetUserByEmail(WithDatabase):
    def test_raises_key_error_if_no_user(self):
        # Arrange
        sut = PasswordResetService()
        sample_email = "noreplay@xamfra.net"
        with self.app.app_context():
            # Act
            # Assert
            with self.assertRaises(KeyError):
                sut.get_user_from_email(sample_email)

    def test_returns_correct_user(self):
        # Arrange
        sut = PasswordResetService()
        sample_email = "noreplay@xamfra.net"
        expected_user = UserMother.simple(email=sample_email)

        with self.app.app_context():
            # Act
            server.db.session.add(expected_user)
            server.db.session.commit()

            # Assert
            user = sut.get_user_from_email(sample_email)
            self.assertEqual(expected_user, user)


class TestPasswordResetServiceGenerateToken(WithApp):  # todo refractor config out
    def setUp(self):
        super().setUp()
        self.sut = PasswordResetService()
        self.sample_user = UserMother.simple()

    @staticmethod
    def _get_token_data(token: str) -> dict:
        return jwt.decode(token, options={"verify_signature": False, "verify_exp": False})

    def test_token_has_correct_email(self):
        # Arrange
        expected_email = self.sample_user.email

        # Act
        with self.app.app_context():
            token = self.sut.generate_token(self.sample_user)
            data = self._get_token_data(token)

        # Assert
        self.assertEqual(data["email"], expected_email)

    def test_token_has_correct_expires_in(self):
        # Arrange
        PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES = 10
        start = datetime.datetime(day=1, month=1, year=2001, hour=20, minute=0, tzinfo=datetime.timezone.utc)
        self.sut._get_datetime_now = lambda: start
        expected_end = start + datetime.timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES)

        # Act
        with self.app.app_context():
            token = self.sut.generate_token(self.sample_user)
            data = self._get_token_data(token)

        # Assert
        self.assertEqual(data["exp"], int(expected_end.timestamp()))

    def test_token_is_signed_using_secret_and_password_hash(self):
        # Arrange
        with self.app.app_context():
            token = self.sut.generate_token(self.sample_user)

            # Act
            jwt.decode(token, current_app.secret_key + self.sample_user.password_hash, algorithms=["HS256"], options={"verify_exp": False})

        # Assert

    def test_token_is_not_signed_using_only_secret(self):
        # Arrange
        with self.app.app_context():
            token = self.sut.generate_token(self.sample_user)

            # Act
            # Assert
            with self.assertRaises(jwt.InvalidSignatureError):
                jwt.decode(token, current_app.secret_key, algorithms=["HS256"], options={"verify_exp": False})


if __name__ == "__main__":
    unittest.main()
