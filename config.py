import os
from datetime import timedelta


class Config(object):
    DEBUG = False
    TESTING = False
    DEVELOPMENT = False

    API_PAGINATION = 10

    PROPAGATE_EXCEPTIONS = True  # needed due to Flask-Restful not passing them up

    SQLALCHEMY_TRACK_MODIFICATIONS = False  # ref: https://stackoverflow.com/questions/33738467/how-do-i-know-if-i-can-disable-sqlalchemy-track-modifications/33790196#33790196

    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_NAME = "X-CSRF-TOKEN"

    REMEMBER_COOKIE_DURATION = timedelta(days=30)
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

    BACKEND_SERVER_PORT = "4999"
    BACKEND_SERVER_HOST = "127.0.0.1"
    BACKEND_SERVER_URL = "https://%s:%s" % (BACKEND_SERVER_HOST, BACKEND_SERVER_PORT)

    SSL_CERT = "cert.pem"
    SSL_KEY = "key.pem"

    SECRET_KEY = os.getenv('SECRET')
    INVITES_SECRET = SECRET_KEY
    PASSWORD_RESET_SECRET = SECRET_KEY
    PUBLIC_VALIDATION_SECRET = SECRET_KEY


class ProductionConfig(Config):
    CSRF_COOKIE_SAMESITE = 'Strict'
    SESSION_PROTECTION = "strong"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'

    FRONTEND_SERVER_URL = "https://127.0.0.1:4999"

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(os.path.abspath(os.path.dirname(__file__)), "",
                                                            "people.db")


class HerokuProductionConfig(ProductionConfig):
    BACKEND_SERVER_PORT = "443"
    BACKEND_SERVER_HOST = "centrifuga4.herokuapp.com"
    BACKEND_SERVER_URL = "https://%s:%s" % (BACKEND_SERVER_HOST, BACKEND_SERVER_PORT)
    FRONTEND_SERVER_URL = BACKEND_SERVER_URL

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')


class DevelopmentConfig(Config):
    DEBUG = True
    DEVELOPMENT = True

    SQLALCHEMY_ECHO = False

    CSRF_DISABLE = True

    LOGIN_DISABLED = True

    CSRF_COOKIE_SAMESITE = 'Lax'  # allow development frontend server
    FRONTEND_SERVER_URL = "https://127.0.0.1:3000"

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(os.path.abspath(os.path.dirname(__file__)), "", "people.db")


class TestingConfig(DevelopmentConfig):
    TESTING = True
