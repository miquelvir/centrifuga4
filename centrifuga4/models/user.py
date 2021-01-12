from flask import current_app
from flask_login import UserMixin
import re

from sqlalchemy import case
from sqlalchemy.orm import validates, column_property

from centrifuga4 import db
from centrifuga4.auth_auth.resource_need import UsersPermission
from centrifuga4.models._base import MyBase
from centrifuga4.models.person import Person
import bcrypt


class User(MyBase, UserMixin):
    __tablename__ = "user"
    __mapper_args__ = {
        'polymorphic_identity': "user"
    }
    permissions = {UsersPermission}

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    surname1 = db.Column(db.Text, nullable=True)
    surname2 = db.Column(db.Text, nullable=True)
    email = db.Column(db.Text, nullable=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    needs = db.relationship("Need", secondary="user_need")

    full_name = column_property(
        case([(name != None, name + " "), ], else_="") +
        case([(surname1 != None, surname1 + " "), ], else_="") +
        case([(surname2 != None, surname2), ], else_=""))

    @validates('name', 'surname1', 'surname2')
    def cleaner1(self, key, value):
        return value.lower().strip() if value else value

    def login(self, password: str) -> bool:
        """ checks if password hash matches stored patch """
        encoded_password: bytes = password.encode("utf-8")
        stored_hash = self.password_hash
        return bcrypt.checkpw(encoded_password, stored_hash)

    @staticmethod
    def hash_password(password: str):
        """ returns the hashed password """
        encoded_password = password.encode("utf-8")
        return bcrypt.hashpw(encoded_password, bcrypt.gensalt())

    @classmethod
    def is_strong_enough_password(cls, password: str) -> bool:
        return all((re.compile("^.{8,64}$").match(password) is not None,
                   re.compile("(?=.*[a-z])$").match(password) is not None,
                   re.compile("(?=.*[A-Z])$").match(password) is not None,
                   re.compile("(?=.*\d)$").match(password) is not None,
                   re.compile("(?=.*[ -\/:-@\[-\`{-~]{1,})").match(password) is not None))

