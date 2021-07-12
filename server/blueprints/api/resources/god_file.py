import csv
from datetime import datetime
import io

from flasgger import SwaggerView
from flask_restful import Resource

from server.auth_auth.action_need import PostPermission
from server.auth_auth.requires import Requires
from server.auth_auth.resource_need import StudentsPermission, CoursesPermission
from server.blueprints.api.resources.course_students_contact_sheet import write_students
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Student


def students_file():
    pass


class GodFile(Resource, SwaggerView):
    @Requires(PostPermission, CoursesPermission, StudentsPermission)
    def post(self):
        query = Student.query
        students: Student = query.all()

        filename = "%s-export-contacts-%s.csv" % (
            SHORT_NAME,
            datetime.now().strftime("%Y%m%dT%H%M%S"),
        )

        with io.StringIO() as proxy:
            spamwriter = csv.writer(proxy)
            write_students(students, spamwriter)

            return make_response_with_file(
                proxy, filename, "text/csv", encoding="utf-8-sig"
            )