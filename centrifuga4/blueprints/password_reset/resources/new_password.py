from threading import Thread

import jwt
from flask import request, current_app
from flask_restful import Resource

from centrifuga4.auth_auth.recaptcha import validate_recaptcha
from centrifuga4.models import User
from centrifuga4 import db
from email_queue.emails.password_change_email import my_job


class NewPasswordCollectionRes(Resource):
    def post(self):
        recaptcha = request.json["recaptcha"]
        validate_recaptcha(recaptcha)

        try:
            password = request.json["password"]
        except KeyError:
            return "no password found in body", 400

        try:
            email = request.json["email"]
        except KeyError:
            return "no username found in body", 400

        try:
            token = request.json["token"]
        except KeyError:
            return "no token found in body", 401

        if not User.is_strong_enough_password(password):
            return (
                "password is not strong enough, must follow: ^.{8,}$, ^.{0,64}$, (?=.*[a-z]), (?=.*[A-Z]), (?=.*\d), (?=.*[ -\/:-@\[-\`{-~]{1,})",
                400,
            )

        try:
            user = User.query.filter(User.email == email).one()

            data = jwt.decode(
                token, current_app.secret_key + user.password_hash, algorithms=["HS256"]
            )

            if data["email"] != user.email:
                return "invalid token for current username", 401

            new_hash = User.hash_password(password)
            if new_hash == user.password_hash:  # password has not changed
                return "you can't use the same password you had", 400

            user.password_hash = new_hash
            db.session.commit()

            thread = Thread(target=my_job, args=(user.email,))
            thread.start()

            return "password change successful", 200

        except jwt.exceptions.ExpiredSignatureError:
            return "token expired", 401
        except Exception as e:
            return "invalid token", 401
