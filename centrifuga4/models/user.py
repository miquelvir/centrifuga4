from flask import current_app
from flask_login import UserMixin
import re
from centrifuga4 import db
from centrifuga4.models.person import Person
import bcrypt


class User(Person, UserMixin):
    __tablename__ = "user"
    __mapper_args__ = {
        'polymorphic_identity': "user"
    }

    id = db.Column(db.Text, db.ForeignKey('person.id'), primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    needs = db.relationship("Need", secondary="user_need")

    def login(self, password: str) -> bool:
        """ checks if password hash matches stored patch """
        return bcrypt.checkpw(password.encode("utf-8"), bytes(self.password_hash))

    @staticmethod
    def hash_password(password: str):
        """ returns the hashed password """
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    @classmethod
    def is_strong_enough_password(cls, password: str) -> bool:
        return all((re.compile("^.{8,64}$").match(password) is not None,
                   re.compile("(?=.*[a-z])$").match(password) is not None,
                   re.compile("(?=.*[A-Z])$").match(password) is not None,
                   re.compile("(?=.*\d)$").match(password) is not None,
                   re.compile("(?=.*[ -\/:-@\[-\`{-~]{1,})").match(password) is not None))
