__version__ = '4.0.1'

from collections import namedtuple
from flask_limiter.util import get_remote_address
from flasgger import Swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_mobility import Mobility
from flask_principal import Principal, identity_loaded, ItemNeed, ActionNeed
from flask_seasurf import SeaSurf
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from flask_talisman import Talisman, GOOGLE_CSP_POLICY
from flask_login import LoginManager, current_user

from config import DevelopmentConfig
from rq import Queue
from rq.job import Job
from email_queue.worker import conn

db = SQLAlchemy()
# man = Talisman()
cors = CORS()  # todo remove prod
q = Queue(connection=conn)  # todo here
login = LoginManager()
principal = Principal()
# csrf = SeaSurf()

temp = {
        "swagger": "2.0",
        "info": {
            "title": "centrífuga4 API",
            "description": "RESTful API for access to centrifuga4 data",
            "contact": {
                "responsibleOrganization": "Xamfrà (Fundació l'Arc Música)",
                "responsibleDeveloper": "mvr"
            },
            "version": "0.0.1"
        },
        # "host": "mysite.com",  # overrides localhost:500
        "basePath": "/api/v1",  # base bash for blueprint registration
        "schemes": [
            "https"
        ]
    }

swagger = Swagger(template=temp)


def init_app(config=DevelopmentConfig):
    # app creation
    app = Flask(__name__, static_folder='../centrifuga4-frontend/build', static_url_path='/')
    app.config.from_object(config)

    # plugin initialization
    db.init_app(app)
    cors.init_app(app)
    login.init_app(app)
    # man.init_app(app)
    swagger.init_app(app)
    principal.init_app(app)
    # csrf.init_app(app)
    # limiter.init_app(app)


    """app.view_functions["flasgger.apidocs"].talisman_view_options = {
        "content_security_policy": {
            "style-src": ["\'self\'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            "font-src": ["\'self\'", "'unsafe-inline'", 'https://fonts.gstatic.com'],
            "img-src": "'self' data:"
        }
    }"""

    with app.app_context():
        from .blueprints import api, dashboard, auth_service, emails_service, invites_service, password_reset_service
        from centrifuga4.models import User

        @app.route('/')
        def index():
            return app.send_static_file('index.html')

        @app.route('/login')
        def index_login():
            return app.send_static_file('index.html')

        @app.route('/signup')
        def index_signup():
            return app.send_static_file('index.html')

        @app.route('/reset-password')
        def index_reset_password():
            return app.send_static_file('index.html')

        @login.user_loader  # todo can move away?
        def load_user(id_):
            return User.query.get(id_)

        @identity_loaded.connect_via(app)   # todo can move away?
        def on_identity_loaded(sender, identity):
            # Set the identity user object
            identity.user = current_user

            if hasattr(current_user, 'permissions'):
                for need in current_user.needs:
                    identity.provides.add(need.need)  # gets the need object instead of the key

        app.register_blueprint(api, url_prefix='/api/v1')
        app.register_blueprint(dashboard, url_prefix='/dashboard/v1')
        app.register_blueprint(auth_service, url_prefix='/auth/v1')
        app.register_blueprint(emails_service, url_prefix='/emails/v1')
        app.register_blueprint(invites_service, url_prefix='/invites/v1')
        app.register_blueprint(password_reset_service, url_prefix='/password-reset/v1')
        # print(swagger.get_apispecs())  # todo customize ui

        return app



