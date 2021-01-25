import csv
import zipfile
from datetime import datetime, timedelta
import io

from flasgger import SwaggerView
from flask import make_response, send_file, current_app, request
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from centrifuga4.auth_auth.action_need import PostPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import StudentsPermission, CoursesPermission
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.blueprints.api.resources.course_students_contact_sheet import (
    write_students,
)
from centrifuga4.constants import SHORT_NAME
from centrifuga4.models import Student, Course, Schedule
from pdfs.enrolment import generate_enrolment_agreement_pdf


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

        proxy = io.StringIO()

        with proxy as fr:
            spamwriter = csv.writer(fr)
            write_students(students, spamwriter)

            f = io.BytesIO()  # todo function
            f.write(proxy.getvalue().encode("utf-8"))
            f.seek(0)
            proxy.close()

            r = make_response(
                send_file(
                    f,
                    as_attachment=True,
                    mimetype="text/csv",
                    attachment_filename=filename,
                )
            )
            r.headers["Access-Control-Expose-Headers"] = "content-disposition"
            return r
