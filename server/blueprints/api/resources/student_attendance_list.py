import csv
from datetime import datetime, timedelta
import io

from flasgger import SwaggerView
from flask_login import login_required
from flask_restful import Resource

from server.auth_auth.require import Require
from server.blueprints.api.errors import NotFound
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Student, Attendance


# todo check status etc
class StudentAttendanceListRes(Resource, SwaggerView):
    @login_required
    def post(self, id_):
        query = Student.query.filter(Student.id == id_)
        student: Student = query.one_or_none()

        Require.ensure.read(student)

        if student is None:
            raise NotFound("resource with the given id not found", requestedId=id_)

        attendances = []
        for attendance in Attendance.query.filter(Attendance.student_id == id_).all():
            Require.ensure.read(attendance)
            attendances.append(attendance)

        filename = "%s-export-student-attendance-%s-%s.csv" % (
            SHORT_NAME,
            student.id,
            datetime.now().strftime("%Y%m%dT%H%M%S"),
        )

        with io.StringIO() as proxy:
            writer = csv.DictWriter(
                proxy,
                fieldnames=[
                    "id",
                    "name",
                    "surname1",
                    "surname2",
                    "course id",
                    "course name",
                    "date",
                    "status",
                    "comment",
                ],
            )

            writer.writeheader()
            for attendance in attendances:
                writer.writerow(
                    {
                        "id": student.id,
                        "name": student.name,
                        "surname1": student.surname1,
                        "surname2": student.surname2,
                        "course id": attendance.course.id,
                        "course name": attendance.course.name,
                        "date": attendance.date,
                        "status": attendance.text_status,
                        "comment": attendance.comment,
                    }
                )

            return make_response_with_file(
                proxy, filename, "text/csv", encoding="utf-8-sig"
            )
