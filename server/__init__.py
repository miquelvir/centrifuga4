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


# https://github.com/pallets/flask/issues/1045
import mimetypes

mimetypes.add_type("application/javascript", ".js")


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
    from config import DevelopmentBuiltConfig, ProductionConfig, DevelopmentConfig

    # app creation
    app = Flask(
        __name__,
        static_folder="../web_app/build",
        static_url_path="/",
        template_folder="../web_app/build",
    )

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
        from . import blueprints
        from .blueprints.api.config import api_blueprint
        from .blueprints.auth import auth_blueprint
        from .blueprints.emails import emails_blueprint
        from .blueprints.password_reset import password_reset_blueprint
        from .blueprints.validation import validation_blueprint
        from .blueprints.pre_enrolment.config import pre_enrolment_blueprint
        from .blueprints.calendars import calendars_blueprint
        from .blueprints.invites import invites_blueprint

        from server.models import User
        from server.auth_auth.principal_identity_loaded import on_identity_loaded

        from server.auth_auth.login_user_loader import user_loader

        from .notifications import signal_handlers

        signal_handlers.add_subscribers()

        # serve the react frontend
        @app.route("/")
        def index():
            return redirect("/app/login")

        @app.route("/app", defaults={"path": None})
        @app.route("/app/<path:path>")
        def index2(path):
            return render_template("index.html")

        @app.route("/404")
        @app.errorhandler(404)
        def page_not_found(e):
            return render_template("not_found.html"), 404

        # add needs loader for Flask Principal
        identity_loaded.connect_via(app)(on_identity_loaded)

        # add identity loader (required to work with remember me)
        # https://stackoverflow.com/questions/24487449/flask-principal-flask-login-remember-me-and-identity-loaded
        @principal.identity_loader
        def load_identity_when_session_expires():
            if hasattr(current_user, "id"):
                return Identity(current_user.id)

        # load blueprints for the different parts
        app.register_blueprint(api_blueprint, url_prefix="/api/v1")
        app.register_blueprint(auth_blueprint, url_prefix="/auth/v1")
        app.register_blueprint(emails_blueprint, url_prefix="/emails/v1")
        app.register_blueprint(invites_blueprint, url_prefix="/invites/v1")
        app.register_blueprint(
            password_reset_blueprint, url_prefix="/password-reset/v1"
        )
        app.register_blueprint(validation_blueprint, url_prefix="/validation/v1")
        app.register_blueprint(pre_enrolment_blueprint, url_prefix="/pre-enrolment/v1")
        app.register_blueprint(calendars_blueprint, url_prefix="/calendars/v1")
        # print(swagger.get_apispecs())  # todo customize ui

        from server.containers import Container

        container = Container()
        container.wire(packages=[blueprints])
        app.container = container

        return app
