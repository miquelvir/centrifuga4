import os
from datetime import timedelta

# todo clean config


class Config(object):
    DEBUG = False
    TESTING = False
    DEVELOPMENT = False

    API_PAGINATION = 10

    PROPAGATE_EXCEPTIONS = True  # needed due to Flask-Restful not passing them up

    SQLALCHEMY_TRACK_MODIFICATIONS = False  # ref: https://stackoverflow.com/questions/33738467/how-do-i-know-if-i-can-disable-sqlalchemy-track-modifications/33790196#33790196

    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_NAME = "X-CSRF-TOKEN"

    REMEMBER_COOKIE_DURATION = timedelta(days=15)
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

    BACKEND_SERVER_PORT = "4999"
    BACKEND_SERVER_HOST = "127.0.0.1"
    BACKEND_SERVER_URL = "https://%s:%s" % (BACKEND_SERVER_HOST, BACKEND_SERVER_PORT)

    SECRET_KEY = os.getenv("SECRET")
    INVITES_SECRET = SECRET_KEY
    PASSWORD_RESET_SECRET = SECRET_KEY
    PUBLIC_VALIDATION_SECRET = SECRET_KEY

    RECAPTCHA = os.getenv("RECAPTCHA")
    RECAPTCHA_URL = "https://www.google.com/recaptcha/api/siteverify"

    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_DOMAIN = os.getenv("SMTP_DOMAIN")
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_FROM_EMAIL = SMTP_USER  # email which will be shown in the 'from' field
    SMTP_REPLY_TO = SMTP_FROM_EMAIL
    SMTP_TLS_PORT = 465

    SMTP_BULK_PASSWORD = os.getenv("SMTP_BULK_PASSWORD")
    SMTP_BULK_USER = os.getenv("SMTP_BULK_USER")
    SMTP_BULK_DOMAIN = os.getenv("SMTP_BULK_DOMAIN")
    SMTP_BULK_FROM_EMAIL = SMTP_USER  # email which will be shown in the 'from' field
    SMTP_BULK_REPLY_TO = SMTP_REPLY_TO
    SMTP_BULK_PORT = 587

    BCC_ADMIN = False

    DEBUGGING_EMAIL = "vazquezrius.miquel@gmail.com"
    DEBUGGING_MODE = bool(int(os.getenv("EMAIL_DEBUGGING_MODE", 0)))
    DEBUGGING_SEND_EMAILS = True


class DevelopmentConfig(Config):
    DEBUG = True
    DEVELOPMENT = True

    SQLALCHEMY_ECHO = False

    CSRF_DISABLE = True

    LOGIN_DISABLED = True
    TESTING = True

    SSL_CERT = "development/cert.pem"
    SSL_KEY = "development/key.pem"

    CSRF_COOKIE_SAMESITE = "Lax"  # allow development frontend server
    FRONTEND_SERVER_URL = "https://127.0.0.1:3000"

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(
        os.path.abspath(os.path.dirname(__file__)), "", "people.db"
    )


class DevelopmentBuiltConfig(DevelopmentConfig):
    CSRF_COOKIE_SAMESITE = "Strict"
    SESSION_PROTECTION = "basic"  # not strict to allow the remember me
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Strict"
    CSRF_DISABLE = False
    LOGIN_DISABLED = False

    DEVELOPMENT = False
    LOGIN_DISABLED = False

    FRONTEND_SERVER_URL = "https://127.0.0.1:4999"

    SQLALCHEMY_DATABASE_URI = "sqlite:///%s" % os.path.join(
        os.path.abspath(os.path.dirname(__file__)), "", "people.db"
    )


class ProductionConfig(Config):
    CSRF_COOKIE_SAMESITE = "Lax"
    SESSION_PROTECTION = "strong"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Strict"

    BACKEND_SERVER_PORT = "443"
    BACKEND_SERVER_HOST = "centrifuga4.herokuapp.com"
    BACKEND_SERVER_URL = "https://%s:%s" % (BACKEND_SERVER_HOST, BACKEND_SERVER_PORT)
    FRONTEND_SERVER_URL = BACKEND_SERVER_URL

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")


class HerokuManualLiveConfig(ProductionConfig):

    SECRET_KEY = "super-secret"
    INVITES_SECRET = "super-secret"
    PASSWORD_RESET_SECRET = "super-secret"
    PUBLIC_VALIDATION_SECRET = "super-secret"

    FRONTEND_SERVER_URL = "https://centrifuga4.herokuapp.com"
    BACKEND_SERVER_PORT = "443"
    BACKEND_SERVER_HOST = "centrifuga4.herokuapp.com"

    SQLALCHEMY_DATABASE_URI = os.getenv("MANUAL_DATABASE_URL")


class TestingConfig(DevelopmentConfig):
    TESTING = True


class TestingConfigNoDb(DevelopmentConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = None
