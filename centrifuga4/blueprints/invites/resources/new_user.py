import jwt
from flask import request, current_app
from flask_principal import Need
from flask_restful import Resource
from centrifuga4.models import User
from centrifuga4 import q, db


class NewUserCollectionRes(Resource):
    def post(self):
        try:
            user_email = request.json["email"]
        except KeyError:
            return "no user email found in body", 400

        try:
            user_name = request.json["name"]
        except KeyError:
            return "no user name found in body", 400

        try:
            user_surname1 = request.json["surname1"]
        except KeyError:
            return "no user surname1 found in body", 400

        try:
            user_surname2 = request.json["surname2"]
        except KeyError:
            return "no user surname2 found in body", 400

        try:
            user_password = request.json["password"]
        except KeyError:
            return "no user password found in body", 400

        try:
            token = request.json["token"]
        except KeyError:
            return "no token found in body", 401

        try:
            data = jwt.decode(token, current_app.secret_key, algorithms=['HS256'])

            if User.query.filter_by(username=user_email).count() > 0:  # todo maybe wait or integrity error and then return?
                return "user already exists", 400

            if data["userEmail"] != user_email:
                return "token does not correspond to requested email", 401

            user_id = User.generate_new_id(db)
            u = User(id=user_id,
                     name=user_name,
                     surname1=user_surname1,
                     surname2=user_surname2,
                     email=user_email,
                    username=user_email,
                     password_hash=User.hash_password(user_password))

            for need_name in data["needs"]:
                need = Need.query.filter_by(name=need_name).one_or_none()  # todo why query always is brought up by linter
                if need:
                    u.needs.append(need)
                else:
                    raise ValueError("invalid need name '%s'" % need_name)

            db.session.add(u)
            db.session.commit()
            return user_id

        except jwt.exceptions.ExpiredSignatureError:
            return "token expired", 401
        except Exception as e:
            print(e)
            return "invalid token", 401
