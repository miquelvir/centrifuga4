import os
from config import HerokuProductionConfig


class HerokuManualLiveConfig(HerokuProductionConfig):

    SECRET_KEY = "super-secret"
    INVITES_SECRET = "super-secret"
    PASSWORD_RESET_SECRET = "super-secret"
    PUBLIC_VALIDATION_SECRET = "super-secret"

    FRONTEND_SERVER_URL = "https://centrifuga4.herokuapp.com"
    BACKEND_SERVER_PORT = "443"
    BACKEND_SERVER_HOST = "centrifuga4.herokuapp.com"

    SQLALCHEMY_DATABASE_URI = os.environ['MANUAL_DATABASE_URL']

