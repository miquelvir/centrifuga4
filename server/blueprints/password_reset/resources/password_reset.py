import datetime
from threading import Thread

import jwt
from flask import request, current_app
from flask_restful import Resource

from server.auth_auth.recaptcha import validate_recaptcha
from server.models import User
from server.emails.emails.password_reset_email import my_job

from server.emails.url_utils import merge_url_query_params


class PasswordResetCollectionRes(Resource):
    def post(self):
        recaptcha = request.json["recaptcha"]

        validate_recaptcha(recaptcha)

        try:
            email = request.json["email"]
        except KeyError:
            return "no username found in body", 400

        user = User.query.filter(User.email == email).one_or_none()
        if user is None:
            return "", 200

        token = jwt.encode(
            {
                "email": user.email,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=10),
            },
            current_app.config["PASSWORD_RESET_SECRET"] + user.password_hash,
            algorithm="HS256",
        )

        def generate_password_reset_link(_token, _email):
            return (
                merge_url_query_params(
                    "%s/app/password-reset" % current_app.config["FRONTEND_SERVER_URL"],
                    {"token": _token, "email": _email, "lan": "cat"},
                ),
                merge_url_query_params(
                    "%s/app/password-reset" % current_app.config["FRONTEND_SERVER_URL"],
                    {"token": _token, "email": _email, "lan": "eng"},
                ),
            )

        thread = Thread(
            target=my_job,
            args=(*generate_password_reset_link(token, email), user.email),
        )
        thread.start()

        return ""
