from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from centrifuga4.blueprints.api.common.errors import Unauthorized, Forbidden
from centrifuga4.errors.authorization import Forbidden as RawForbidden

from .resources.welcome_email import WelcomeEmailCollectionRes, WelcomeEmailRes

emails_blueprint = Blueprint('emails', __name__)


@emails_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@emails_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(emails_blueprint)

api.add_resource(WelcomeEmailRes, '/welcomeEmail/<job_id>')
api.add_resource(WelcomeEmailCollectionRes, '/welcomeEmail')

