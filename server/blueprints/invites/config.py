from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.errors import Unauthorized, Forbidden
from server.errors.authorization import Forbidden as RawForbidden
from .resources.new_user import NewUserCollectionRes

from .resources.user_invite import UserInviteCollectionRes

invites_blueprint = Blueprint("invites", __name__)


@invites_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(invites_blueprint)

api.add_resource(UserInviteCollectionRes, "/userInvite")
api.add_resource(NewUserCollectionRes, "/newUser")
