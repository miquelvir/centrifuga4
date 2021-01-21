from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from centrifuga4.blueprints.api.errors import Unauthorized, Forbidden
from centrifuga4.blueprints.pre_enrollment.resources.courses import Courses
from centrifuga4.blueprints.pre_enrollment.resources.pre_enrollment import PreEnrollment
from centrifuga4.errors.authorization import Forbidden as RawForbidden

pre_enrollment_blueprint = Blueprint("pre_enrolment", __name__)


@pre_enrollment_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@pre_enrollment_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(pre_enrollment_blueprint)

api.add_resource(Courses, "/courses")
api.add_resource(PreEnrollment, "/pre-enrolment")
