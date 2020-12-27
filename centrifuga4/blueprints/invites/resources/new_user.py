import jwt
from flask import request, current_app
from flask_restful import Resource
from centrifuga4.blueprints.api.common.identifiers import generate_new_id
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

        if User.query.filter_by(username=user_email).count() > 0:
            return "user already exists", 400

        try:
            data = jwt.decode(token, current_app.secret_key, algorithms=['HS256'])

            if data["userEmail"] != user_email:
                return "token does not correspond to requested email", 401

            user_id = generate_new_id(db, model=User)
            u = User(id=user_id,
                     name=user_name,
                     surname1=user_surname1,
                     surname2=user_surname2,
                     email=user_email,
                    username=user_email,  # todo uniqueness in model
                     password_hash=User.hash_password(user_password),
                 privilege_read=True)

            for need in data["needs"]:
                u.needs.append(need)  # todo search and add properly, by id or need to query?
            # todo with privileges
            db.session.add(u)
            db.session.commit()
            return user_id

        except jwt.exceptions.ExpiredSignatureError:
            return "token expired", 401
        except Exception as e:
            print(e)
            return "invalid token", 401
