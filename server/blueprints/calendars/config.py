from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.errors import Unauthorized, Forbidden
from server.errors.authorization import Forbidden as RawForbidden
from .resources.calendars import CalendarRes


calendars_blueprint = Blueprint("calendars", __name__)


@calendars_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(calendars_blueprint)

api.add_resource(CalendarRes, "/<string:res>/<string:course_id>/<string:calendar_id>")
