from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from server.blueprints.api.errors import Unauthorized, Forbidden
from server.blueprints.password_reset.resources.new_password import (
    NewPasswordCollectionRes,
)
from server.blueprints.password_reset.resources.password_reset import (
    PasswordResetCollectionRes,
)
from server.errors.authorization import Forbidden as RawForbidden

password_reset_blueprint = Blueprint("password_reset", __name__)


@password_reset_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@password_reset_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(password_reset_blueprint)

api.add_resource(PasswordResetCollectionRes, "/passwordReset")
api.add_resource(NewPasswordCollectionRes, "/newPassword")
