__version__ = "4.0.1"

import os

from flasgger import Swagger
from flask_cors import CORS
from flask_principal import Principal, identity_loaded, Identity
from flask_seasurf import SeaSurf
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, render_template, redirect
from flask_talisman import Talisman
from flask_login import LoginManager, current_user

from config import DevelopmentBuiltConfig, ProductionConfig, DevelopmentConfig

db = SQLAlchemy()
man = Talisman()
login = LoginManager()
principal = Principal()
csrf = SeaSurf()

temp = {
    "swagger": "2.0",
    "info": {
        "title": "centrífuga4 API",
        "description": "RESTful API for access to centrifuga4 data",
        "contact": {
            "responsibleOrganization": "Xamfrà (Fundació l'Arc Música)",
            "responsibleDeveloper": "mvr",
        },
        "version": "0.0.1",
    },
    # "host": "mysite.com",  # overrides localhost:500
    "basePath": "/api/v1",  # base bash for blueprint registration
    "schemes": ["https"],
}

swagger = Swagger(template=temp)


def init_app(config=None):
    if config is None:
        env = os.getenv("ENVIRONMENT")
        if env == "production":
            config = ProductionConfig
        elif env == "development-built":
            config = DevelopmentBuiltConfig
        elif env == "development":
            config = DevelopmentConfig
        else:
            raise ValueError("no environment variable found")

    # app creation
    app = Flask(
        __name__,
        static_folder="../web_app/build",
        static_url_path="/",
        template_folder="../web_app/build",
    )

    app.config.from_object(config)

    # plugin initialization
    db.init_app(app)
    login.init_app(app)

    if app.config["DEVELOPMENT"]:
        # allow cors only during development (due to the front end development server)
        cors = CORS()
        cors.init_app(app)

    man.init_app(
        app,
        content_security_policy={
            "style-src": ["'self'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "'unsafe-inline'", "https://fonts.gstatic.com"],
            "script-src": ["'self'", "www.google.com"],  # allow google for recaptcha
            "default-src": ["'self'"],
            "img-src": ["'self'", "www.gstatic.com"],  # allow google for recaptcha
            "frame-src": ["www.google.com"],  # allow google for recaptcha
        },
        content_security_policy_nonce_in=["script-src", "style-src"],
    )

    swagger.init_app(app)
    principal.init_app(app)
    csrf.init_app(app)

    with app.app_context():
        from .blueprints import (
            api,
            auth_service,
            emails_service,
            invites_service,
            password_reset_service,
            validation_blueprint,
            pre_enrolment_blueprint,
            calendars_blueprint,
        )
        from server.models import User
        from server.auth_auth.principal_identity_loaded import on_identity_loaded

        from server.auth_auth.login_user_loader import user_loader

        # serve the react frontend
        @app.route("/")
        def index():
            return redirect("/app/login")

        @app.route("/app", defaults={"path": None})
        @app.route("/app/<path:path>")
        def index2(path):
            return render_template("index.html")

        @app.errorhandler(404)
        def page_not_found(e):
            return "not here... 👻", 404

        # add needs loader for Flask Principal
        identity_loaded.connect_via(app)(on_identity_loaded)

        # add identity loader (required to work with remember me)
        # https://stackoverflow.com/questions/24487449/flask-principal-flask-login-remember-me-and-identity-loaded
        @principal.identity_loader
        def load_identity_when_session_expires():
            if hasattr(current_user, "id"):
                return Identity(current_user.id)

        # load blueprints for the different parts
        app.register_blueprint(api, url_prefix="/api/v1")
        app.register_blueprint(auth_service, url_prefix="/auth/v1")
        app.register_blueprint(emails_service, url_prefix="/emails/v1")
        app.register_blueprint(invites_service, url_prefix="/invites/v1")
        app.register_blueprint(password_reset_service, url_prefix="/password-reset/v1")
        app.register_blueprint(validation_blueprint, url_prefix="/validation/v1")
        app.register_blueprint(pre_enrolment_blueprint, url_prefix="/pre-enrolment/v1")
        app.register_blueprint(calendars_blueprint, url_prefix="/calendars/v1")
        # print(swagger.get_apispecs())  # todo customize ui

        return app
