import os
import secrets
import tempfile
from datetime import timedelta


class Config(object):
    DEBUG = False
    TESTING = False

    PROPAGATE_EXCEPTIONS = True  # needed due to Flask-Restful not passing them up
    SECRET_KEY = "super-secret"  # secrets.token_hex()  # todo production

    SQLALCHEMY_TRACK_MODIFICATIONS = False  # ref: https://stackoverflow.com/questions/33738467/how-do-i-know-if-i-can-disable-sqlalchemy-track-modifications/33790196#33790196

    # todo CSRF_COOKIE_SAMESITE = 'Strict'
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_NAME = "X-CSRF-TOKEN"

    # SESSION_COOKIE_SECURE = True
    # SESSION_COOKIE_HTTPONLY = True
    # todo SESSION_COOKIE_SAMESITE = 'Strict'

    REMEMBER_COOKIE_DURATION = timedelta(days=30)
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    # todo SESSION_PROTECTION = "strong"


class ProductionConfig(Config):
    pass  # todo


class DevelopmentConfig(Config):
    DEBUG = True

    SQLALCHEMY_ECHO = False

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(os.path.abspath(os.path.dirname(__file__)), ".", "people.db")


class TestingConfig(Config):
    TESTING = True

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(os.path.abspath(os.path.dirname(__file__)), ".", "people_test.db")

