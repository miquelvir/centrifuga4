import datetime
from typing import Optional, Container

import jwt
from dependency_injector.wiring import Provide
from flask import current_app
from werkzeug.exceptions import BadRequest, Unauthorized

from server import db
from server.models import User

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.services.jwt_service import JwtService
from server.signals import user_password_reset_request, user_password_changed


PASSWORD_RESET_TOKEN_EXPIRES_IN = datetime.timedelta(
            minutes=10
        )


class PasswordResetService:
    def __init__(self, jwt_service: "JwtService"):
        self.jwt_service = jwt_service

    def generate_token(self, user: User) -> str:
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
        :param jwt_service: service to generate/decode JWTs
        :return: password reset token with the user email and expiration time
        """

        body = {"email": user.email}
        return self.jwt_service.encode(
            body,
            expires_in=PASSWORD_RESET_TOKEN_EXPIRES_IN,
            secret=current_app.config["PASSWORD_RESET_SECRET"] + user.password_hash,
        )

    def try_decode_token(self, password_hash, token: str):
        try:
            return self.jwt_service.decode(
                token,
                secret=current_app.secret_key + password_hash,
            )
        except jwt.ExpiredSignatureError:
            raise Unauthorized("token expired")
        except jwt.InvalidTokenError:
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
        """updates the user to use the new password saving the new hash (if the password is not repeated)"""
        if not self.is_strong_enough_password(password):
            raise BadRequest("password does not meet security constraints, too weak")

        self._update_user_password(user, password)

    # unittest:none
    @staticmethod
    def is_strong_enough_password(password: str):
        return User.is_strong_enough_password(password)

    # unittest:none
    def trigger_event_user_password_reset_request(
        self, user: User, token: bytes
    ) -> None:
        user_password_reset_request.send(self, user=user, token=token)

    # unittest:none
    def trigger_event_user_password_reset_redeem(self, user: User) -> None:
        user_password_changed.send(self, user=user)
