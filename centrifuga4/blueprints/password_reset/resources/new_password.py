import jwt
from flask import request, current_app
from flask_restful import Resource
from centrifuga4.blueprints.api.common.identifiers import generate_new_id
from centrifuga4.models import User
from centrifuga4 import q, db


class NewPasswordCollectionRes(Resource):
    def post(self):
        try:
            password = request.json["password"]
        except KeyError:
            return "no password found in body", 400

        try:
            username = request.json["username"]
        except KeyError:
            return "no username found in body", 400

        try:
            token = request.json["token"]
        except KeyError:
            return "no token found in body", 401

        try:
            user = User.query.filter_by(username=username).one()

            data = jwt.decode(token, current_app.secret_key + user.password_hash, algorithms=['HS256'])

            if data["username"] != user.username:
                return "invalid token for current username", 401

            user.password_hash = User.hash_password(password)
            db.session.commit()

            return "password change successful", 200

        except jwt.exceptions.ExpiredSignatureError:
            return "token expired", 401
        except Exception as e:
            return "invalid token", 401
