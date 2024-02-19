from dependency_injector.wiring import Provide
from flask import request, current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest, InternalServerError

from server.blueprints.password_reset.services.password_reset_service import (
    PasswordResetService,
)
from server.containers import Container
from server.services.recaptcha_service import RecaptchaService
from server.services.audit_service import audit_log_alert


SUCCESS_MESSAGE = "if there is a user for this email, it will receive a password reset token via email"


class PasswordResetCollectionRes(Resource):
    def post(
        self,
        recaptcha_service: RecaptchaService = Provide[Container.recaptcha_service],
        password_reset_service: PasswordResetService = Provide[
            Container.password_reset_service
        ],
    ):
        if request.json is None:
            audit_log_alert("Password request failed (no body)")
            raise BadRequest("no json found")

        # validate recaptcha
        recaptcha = request.json.get("recaptcha", None)
        try:
            recaptcha_service.validate(recaptcha)
        except (BadRequest, InternalServerError):
            audit_log_alert("Password request failed (invalid captcha)")
            raise

        email = request.json.get("email", None)
        try:
            user = password_reset_service.get_user_from_email(email)
        except BadRequest:
            audit_log_alert(f"Password request failed (no email found). Email: {email}")
            raise
        except KeyError:
            audit_log_alert(
                f"Password request failed (no user with the given email). Email: {email}"
            )
            # no user found for this email, but don't reveal the result (privacy & security concerns)
            return SUCCESS_MESSAGE

        token = password_reset_service.generate_token(user)

        password_reset_service.trigger_event_user_password_reset_request(user, token)
        audit_log_alert(f"Password request successful. Email: {email}")
        return SUCCESS_MESSAGE
