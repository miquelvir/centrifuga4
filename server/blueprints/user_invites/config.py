from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.errors import Forbidden
from server.errors.authorization import Forbidden as RawForbidden
from .resources.user_invite_redeem import UserInviteRedeemRes

from .resources.user_invite_request import UserInviteRequestCollectionRes

invites_blueprint = Blueprint("invites", __name__)


@invites_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(invites_blueprint)

api.add_resource(UserInviteRequestCollectionRes, "/request")
api.add_resource(UserInviteRedeemRes, "/redeem")
