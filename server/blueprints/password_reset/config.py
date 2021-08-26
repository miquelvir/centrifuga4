from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.errors import Forbidden
from server.blueprints.password_reset.resources.password_reset_redeem import (
    NewPasswordCollectionRes,
)
from server.blueprints.password_reset.resources.password_reset_request import (
    PasswordResetCollectionRes,
)
from server.errors.authorization import Forbidden as RawForbidden

password_reset_blueprint = Blueprint("password_reset", __name__)


@password_reset_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(password_reset_blueprint)

api.add_resource(PasswordResetCollectionRes, "/request")
api.add_resource(NewPasswordCollectionRes, "/redeem")
