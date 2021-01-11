from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from centrifuga4.blueprints.api.errors import Unauthorized, Forbidden
from centrifuga4.errors.authorization import Forbidden as RawForbidden
from .resources.new_user import NewUserCollectionRes

from .resources.user_invite import UserInviteCollectionRes

invites_blueprint = Blueprint('invites', __name__)


@invites_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@invites_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(invites_blueprint)

api.add_resource(UserInviteCollectionRes, '/userInvite')
api.add_resource(NewUserCollectionRes, '/newUser')

