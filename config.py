import os
import secrets
import tempfile
from datetime import timedelta


class Config(object):
    DEBUG = False
    TESTING = False

    PROPAGATE_EXCEPTIONS = True  # needed due to Flask-Restful not passing them up
    SECRET_KEY = secrets.token_hex()  # todo production

    SQLALCHEMY_TRACK_MODIFICATIONS = False  # ref: https://stackoverflow.com/questions/33738467/how-do-i-know-if-i-can-disable-sqlalchemy-track-modifications/33790196#33790196

    JWT_TOKEN_LOCATION = ["cookies"]  # store JWTs in cookies
    JWT_COOKIE_SECURE = True
    JWT_ACCESS_COOKIE_PATH = '/'   # todo test list # all points (except login) need cookie, so we generalise and send them always
    JWT_REFRESH_COOKIE_PATH = '/auth/v1/token/refresh'  # only send refresh cookie for the refresh endpoint
    JWT_COOKIE_CSRF_PROTECT = True  # csrf double submit protection, ref: http://www.redotheweb.com/2015/11/09/api-security.html
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_ACCESS_CSRF_HEADER_NAME = "X-CSRF-ACCESS-TOKEN"
    JWT_REFRESH_CSRF_HEADER_NAME = "X-CSRF-REFRESH-TOKEN"


class ProductionConfig(Config):
    pass  # todo


class DevelopmentConfig(Config):
    DEBUG = True

    SQLALCHEMY_ECHO = False

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(os.path.abspath(os.path.dirname(__file__)), ".", "people.db")


class TestingConfig(Config):
    TESTING = True

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(os.path.abspath(os.path.dirname(__file__)), ".", "people_test.db")

