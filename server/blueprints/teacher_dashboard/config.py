from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.errors import Forbidden
from server.blueprints.teacher_dashboard.resources.teacher_dashboard import (
    TeacherDashboardResource,
)

from server.errors.authorization import Forbidden as RawForbidden

teacher_dashboard_blueprint = Blueprint(
    "teacher_dashboard", __name__, template_folder="templates"
)


@teacher_dashboard_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


teacher_dashboard = Api(teacher_dashboard_blueprint)

teacher_dashboard.add_resource(
    TeacherDashboardResource, "/teachers/<string:id_>/courses"
)
