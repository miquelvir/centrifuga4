__version__ = '4.0.1'

from flasgger import Swagger
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mobility import Mobility
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from flask_talisman import Talisman, GOOGLE_CSP_POLICY
from config import DevelopmentConfig
from rq import Queue
from rq.job import Job
from email_queue.worker import conn

mobility = Mobility()  # todo needed?
db = SQLAlchemy()
jwt = JWTManager()
# man = Talisman()
cors = CORS()  # todo remove prod
q = Queue(connection=conn)  # todo here

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
    app = Flask(__name__)
    app.config.from_object(config)

    # plugin initialization
    mobility.init_app(app)
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    # man.init_app(app, content_security_policy=GOOGLE_CSP_POLICY)
    swagger.init_app(app)


    """app.view_functions["flasgger.apidocs"].talisman_view_options = {
        "content_security_policy": {
            "style-src": ["\'self\'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            "font-src": ["\'self\'", "'unsafe-inline'", 'https://fonts.gstatic.com'],
            "img-src": "'self' data:"
        }
    }"""

    with app.app_context():
        from .blueprints import api, dashboard, auth, emails_service

        app.register_blueprint(api, url_prefix='/api/v1')
        app.register_blueprint(dashboard, url_prefix='/dashboard/v1')
        app.register_blueprint(auth, url_prefix='/auth/v1')
        app.register_blueprint(emails_service, url_prefix='/email-service')

        # print(swagger.get_apispecs())  # todo customize ui

        return app



