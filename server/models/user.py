from flask import current_app
from flask_login import UserMixin
import re

from sqlalchemy import case
from sqlalchemy.orm import validates, column_property

from server import db
from server.models._base import MyBase
import bcrypt

from server.services.totp_service import TotpService


class User(MyBase, UserMixin):
    __tablename__ = "user"
    __mapper_args__ = {"polymorphic_identity": "user"}

    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    surname1 = db.Column(db.Text, nullable=True)
    surname2 = db.Column(db.Text, nullable=True)
    email = db.Column(db.Text, nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)
    totp_secret = db.Column(db.Text, nullable=True)

    role_id = db.Column(db.Text, db.ForeignKey("role.id"), nullable=True)
    role = db.relationship("Role")

    teacher_id = db.Column(db.Text, db.ForeignKey("teacher.id"))
    teacher = db.relationship("Teacher")

    full_name = column_property(
        case([(name != None, name + " ")], else_="")
        + case([(surname1 != None, surname1 + " ")], else_="")
        + case([(surname2 != None, surname2)], else_="")
    )

    @validates("name", "surname1", "surname2")
    def cleaner1(self, key, value):
        return value.lower().strip() if value else value

    def login(self, password: str) -> bool:
        """checks if password hash matches stored patch"""
        encoded_password: bytes = password.encode("utf-8")
        stored_hash: bytes = self.password_hash.encode("utf-8")
        return bcrypt.checkpw(encoded_password, stored_hash)

    @staticmethod
    def hash_password(password: str):
        """returns the hashed password"""
        encoded_password = password.encode("utf-8")
        return bcrypt.hashpw(encoded_password, bcrypt.gensalt()).decode("utf-8")

    @classmethod
    def is_strong_enough_password(cls, password: str) -> bool:
        """:returns true if the password is strong enough, false otherwise

        a valid password must fulfill:
        - is a string
        - has length between 8 and 64 chars
        - has 1+ lowercase character
        - has 1+ uppercase character
        - has 1+ digit
        - has a special character in -/:-@[-`{-~]{1,}
        """
        if type(password) is not str:
            return False
        return all(
            (
                re.compile("^.{8,64}$").match(password) is not None,
                re.compile("(?=.*[a-z])").match(password) is not None,
                re.compile("(?=.*[A-Z])").match(password) is not None,
                re.compile("(?=.*\d)").match(password) is not None,
                re.compile("(?=.*[-\/:-@\!.,+`´\-%&\(\)#$€_[-`{-~]{1,})").match(
                    password
                )
                is not None,
            )
        )

    def user_representation(self):
        return self.full_name
