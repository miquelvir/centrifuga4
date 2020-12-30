from flask import current_app
from flask_login import UserMixin

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
