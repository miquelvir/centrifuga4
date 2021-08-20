from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.resources.course_attendance import CoursesAttendanceRes
from server.blueprints.api.resources.course_attendance_list import (
    CoursesAttendanceListRes,
)
from server.blueprints.api.resources.course_students_contact_sheet import (
    CourseContactSheet,
)
from server.blueprints.api.resources.god_file import GodFile
from server.easy_api.resource_factory import get_resources
from server.blueprints.api.errors import Unauthorized, Forbidden
from server.blueprints.api.resources.payment_receipts import PaymentsReceiptsRes
from server.blueprints.api.resources.student_enrolment_agreement import (
    StudentsEnrollmentAgreementRes,
)
from server.blueprints.api.resources.student_grant_letter import StudentsGrantLettersRes

from server.errors.authorization import Forbidden as RawForbidden
from server.models import (
    User,
    Student,
    Guardian,
    Course,
    Payment,
    Schedule,
    Teacher,
    Room,
    Role,
)

api_blueprint = Blueprint("api", __name__, template_folder="templates")


@api_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(api_blueprint)

api.add_resource(StudentsGrantLettersRes, "/students/<string:id_>/grantLetter")
api.add_resource(
    StudentsEnrollmentAgreementRes, "/students/<string:id_>/enrolmentAgreement"
)
api.add_resource(PaymentsReceiptsRes, "/payments/<string:id_>/receipt")
api.add_resource(CoursesAttendanceListRes, "/courses/<string:id_>/attendanceList")
api.add_resource(CourseContactSheet, "/courses/<string:id_>/contactsSheet")
api.add_resource(CoursesAttendanceRes, "/courses/<string:id_>/attendance")
api.add_resource(GodFile, "/files/god")


for model in (Student, Guardian, Course, Payment, Schedule, Teacher, Room, User, Role):
    for res in get_resources(model):
        api.add_resource(*res)
