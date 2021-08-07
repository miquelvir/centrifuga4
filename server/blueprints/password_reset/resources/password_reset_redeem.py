from threading import Thread

import jwt
from dependency_injector.wiring import Provide
from flask import request, current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest, Unauthorized, InternalServerError


from server.blueprints.password_reset.services.password_reset_service import (
    PasswordResetService,
)
from server.containers import Container
from server.models import User
from server import db
from server.services.recaptcha_service import RecaptchaService

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
        recaptcha_service: RecaptchaService = Provide[Container.recaptcha_service],
        password_reset_service: PasswordResetService = Provide[
            Container.password_reset_service
        ],
    ):

        if request.json is None:
            raise BadRequest("no json found")

        # validate recaptcha
        recaptcha = request.json.get("recaptcha", None)
        try:
            recaptcha_service.validate(recaptcha)
        except (BadRequest, InternalServerError):
            raise

        try:
            password = request.json["password"]
        except KeyError:
            raise BadRequest("no password found in body")

        try:
            token = request.json["token"]
        except KeyError:
            raise Unauthorized("no token found in body")

        if not User.is_strong_enough_password(password):
            raise BadRequestNotStrongPassword()

        data = jwt.decode(token, options=DONT_VERIFY)

        if "email" not in data:
            raise BadRequest("token has no email field in the body")

        email = data["email"]
        if email is None:
            raise BadRequest("token has value 'None' for field email")

        try:
            user = password_reset_service.get_user_from_email(email)
        except BadRequest:
            raise
        except KeyError:
            raise BadRequest(f"no user found for email {email!r}")

        try:
            password_reset_service.try_decode_token(user.password_hash, token)
        except Unauthorized:
            raise

        try:
            password_reset_service.update_user_password(user, password)
        except BadRequest:
            raise

        password_reset_service.trigger_event_user_password_reset_redeem(user)

        return "password change successful", 200  # todo return json instead
