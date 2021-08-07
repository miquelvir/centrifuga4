from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from server.blueprints.api.errors import Unauthorized, Forbidden
from server.blueprints.pre_enrolment.resources.courses import Courses
from server.blueprints.pre_enrolment.resources.pre_enrolment import PreEnrollment
from server.errors.authorization import Forbidden as RawForbidden

pre_enrolment_blueprint = Blueprint("pre_enrolment", __name__)


@pre_enrolment_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@pre_enrolment_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(pre_enrolment_blueprint)

api.add_resource(Courses, "/courses")
api.add_resource(PreEnrollment, "/pre-enrolment")
