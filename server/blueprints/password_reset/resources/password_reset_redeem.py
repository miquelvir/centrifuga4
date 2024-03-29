from threading import Thread

import jwt
from dependency_injector.wiring import Provide
from flask import request, current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest, Unauthorized, InternalServerError


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.blueprints.password_reset.services.password_reset_service import (
        PasswordResetService,
    )
    from server.services.recaptcha_service import RecaptchaService

from server.services.audit_service import audit_log_alert
from server.containers import Container
from server.models import User

DONT_VERIFY = {"verify_signature": False}


class BadRequestNotStrongPassword(BadRequest):
    NOT_STRONG_PASSWORD_MESSAGE = (
        "password is not strong enough, must follow: "
        "^.{8,}$, ^.{0,64}$, (?=.*[a-z]), (?=.*[A-Z]), (?=.*\d), "
        "(?=.*[ -\/:-@\[-\`{-~]{1,})"
    )

    def __init__(self):
        super().__init__(self.NOT_STRONG_PASSWORD_MESSAGE)


class NewPasswordCollectionRes(Resource):
    def post(
        self,
        recaptcha_service: "RecaptchaService" = Provide[Container.recaptcha_service],
        password_reset_service: "PasswordResetService" = Provide[
            Container.password_reset_service
        ],
    ):

        if request.json is None:
            audit_log_alert("Password redeem failed (no json body)")
            raise BadRequest("no json found")

        # validate recaptcha
        recaptcha = request.json.get("recaptcha", None)
        try:
            recaptcha_service.validate(recaptcha)
        except (BadRequest, InternalServerError):
            audit_log_alert("Password redeem failed (bad recaptcha)")
            raise

        try:
            password = request.json["password"]
        except KeyError:
            audit_log_alert("Password redeem failed (no password)")
            raise BadRequest("no password found in body")

        try:
            token = request.json["token"]
        except KeyError:
            audit_log_alert("Password redeem failed (no token)")
            raise Unauthorized("no token found in body")

        if not User.is_strong_enough_password(password):
            audit_log_alert("Password redeem failed (weak password)")
            raise BadRequestNotStrongPassword()

        data = jwt.decode(token, options=DONT_VERIFY)

        if "email" not in data:
            audit_log_alert("Password redeem failed (no email)")
            raise BadRequest("token has no email field in the body")

        email = data["email"]
        if email is None:
            audit_log_alert("Password redeem failed (token has value None for email)")
            raise BadRequest("token has value 'None' for field email")

        try:
            user = password_reset_service.get_user_from_email(email)
        except BadRequest:
            audit_log_alert(
                f"Password redeem failed (no user with the given email). Email: {email}"
            )
            raise
        except KeyError:
            audit_log_alert(
                f"Password redeem failed (no user with the given email). Email: {email}"
            )
            raise BadRequest(f"no user found for email {email!r}")

        try:
            password_reset_service.try_decode_token(user.password_hash, token)
        except Unauthorized:
            audit_log_alert(f"Password redeem failed (invalid token). Email: {email}")
            raise

        try:
            password_reset_service.update_user_password(user, password)
        except BadRequest:
            audit_log_alert(
                f"Password redeem failed (could not update password). Email: {email}"
            )
            raise

        password_reset_service.trigger_event_user_password_reset_redeem(user)
        audit_log_alert(f"Password redeem successful. Email: {email}")

        return "password change successful", 200  # todo return json instead
