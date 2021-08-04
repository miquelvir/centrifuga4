import datetime
from typing import Optional

import jwt
from flask import current_app
from werkzeug.exceptions import BadRequest, Unauthorized

from server import db
from server.models import User
from server.signals import user_password_reset_request, user_password_changed


JWT_ALGORITHM = "HS256"
PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES = 10


class PasswordResetService:
    @staticmethod
    def _get_datetime_now():
        return datetime.datetime.utcnow()

    def generate_token(self, user: User) -> bytes:
        """
        creates a password reset token

        the token is signed using the server secret + the old user password hash, instead of just using the secret
            why? once the user has changed the old password, the token won't be valid again
            known risks: the token can actually be used again:
                - requests token 1
                - resets password A ---> token 1 ---> B
                - requests token 2
                - resets password B ---> token 2 ---> A
                - token 1 can be used once again until it expires

        :param user: the user for which a password reset token is to be generated
        :param secret: secret string used for signing within the app
        :return: password reset token with the user email and expiration time
        """

        expires_delta = datetime.timedelta(minutes=PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES)
        expiration_datetime = self._get_datetime_now() + expires_delta
        body = {
            "email": user.email,
            "exp": expiration_datetime
        }
        return jwt.encode(
            body,
            current_app.config["PASSWORD_RESET_SECRET"] + user.password_hash,  # sign the token using secret + old password hash
            algorithm=JWT_ALGORITHM,
        )

    @staticmethod
    def try_decode_token(password_hash, token: str):
        try:
            return jwt.decode(
                token, current_app.secret_key + password_hash, algorithms=["HS256"]
            )
        except jwt.exceptions.ExpiredSignatureError:
            raise Unauthorized("token expired")
        except jwt.exceptions.InvalidTokenError:
            raise Unauthorized("invalid token")

    @staticmethod
    def get_user_from_email(email: Optional[str]) -> User:
        if email is None:
            raise BadRequest("no email found in body")

        user = User.query.filter(User.email == email).one_or_none()

        if user is None:
            raise KeyError

        return user

    @staticmethod
    def _update_user_password(user: User, password: str) -> None:
        new_hash = User.hash_password(password)
        if new_hash == user.password_hash:  # password has not changed
            raise BadRequest("repeating the old password is not allowed")

        user.password_hash = new_hash
        db.session.commit()

    def update_user_password(self, user: User, password: str) -> None:
        """ updates the user to use the new password saving the new hash (if the password is not repeated) """
        if not self.is_strong_enough_password(password):
            raise BadRequest("password does not meet security constraints, too weak")

        self._update_user_password(user, password)

    # unittest:none
    @staticmethod
    def is_strong_enough_password(password: str):
        return User.is_strong_enough_password(password)

    # unittest:none
    def trigger_event_user_password_reset_request(self, user: User, token: bytes) -> None:
        user_password_reset_request.send(self, user=user, token=token)

    # unittest:none
    def trigger_event_user_password_reset_redeem(self, user: User) -> None:
        user_password_changed.send(self, user=user)
