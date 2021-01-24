from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from centrifuga4.blueprints.api.resources.course_attendance_list import (
    CoursesAttendanceListRes,
)
from centrifuga4.blueprints.api.resources.course_students_contact_sheet import (
    CourseContactSheet,
)
from centrifuga4.easy_api.resource_factory import get_resources
from centrifuga4.blueprints.api.errors import Unauthorized, Forbidden
from centrifuga4.blueprints.api.resources.payment_receipts import PaymentsReceiptsRes
from centrifuga4.blueprints.api.resources.student_enrollment_agreement import (
    StudentsEnrollmentAgreementRes,
)
from centrifuga4.blueprints.api.resources.student_grant_letter import (
    StudentsGrantLettersRes,
)

from centrifuga4.errors.authorization import Forbidden as RawForbidden
from centrifuga4.models import (
    User,
    Student,
    Guardian,
    Course,
    Payment,
    Schedule,
    Teacher,
    Room,
)

api_blueprint = Blueprint("api", __name__, template_folder="templates")


@api_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@api_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(api_blueprint)

api.add_resource(StudentsGrantLettersRes, "/students/<string:id_>/grantLetter")
api.add_resource(
    StudentsEnrollmentAgreementRes, "/students/<string:id_>/enrollmentAgreement"
)
api.add_resource(PaymentsReceiptsRes, "/payments/<string:id_>/receipt")
api.add_resource(CoursesAttendanceListRes, "/courses/<string:id_>/attendanceList")
api.add_resource(CourseContactSheet, "/courses/<string:id_>/contactsSheet")


for model in (Student, Guardian, Course, Payment, Schedule, Teacher, Room, User):
    for res in get_resources(model):
        api.add_resource(
            *res
        )  # todo users in schema password is load only, hash cant be loaded nor dumped
