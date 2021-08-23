import csv
from datetime import datetime, timedelta
import io

from flasgger import SwaggerView
from flask_restful import Resource

from server.auth_auth.require import Require
from server.blueprints.api.errors import NotFound
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Course, Attendance


# todo check status etc
class CoursesAttendanceV2ListRes(Resource, SwaggerView):
    def post(self, id_):
        query = Course.query.filter(Course.id == id_)
        course: Course = query.one_or_none()

        Require.ensure.read(course)

        if course is None:
            raise NotFound("resource with the given id not found", requestedId=id_)

        students = {}
        attendances = {}
        field_names = set()
        for attendance in Attendance.query.filter(Attendance.course_id == id_).all():
            Require.ensure.read(attendance)

            student_id = attendance.student_id
            if student_id not in attendances:
                attendances[student_id] = []
            attendances[student_id].append(attendance)
            field_names.add(str(attendance.date))

            if student_id not in students:
                students[student_id] = attendance.student

        filename = "%s-export-attendance-%s-%s.csv" % (
            SHORT_NAME,
            course.id,
            datetime.now().strftime("%Y%m%dT%H%M%S"),
        )

        with io.StringIO() as proxy:
            writer = csv.DictWriter(proxy, fieldnames=['name', 'surname1', 'surname2']+sorted(list(field_names) + [f"{date} - comments" for date in field_names]))

            writer.writeheader()
            for student_id, attendances in attendances.items():
                student = students[student_id]
                writer.writerow({**{'name': student.name, 'surname1': student.surname1, 'surname2': student.surname2},
                                 **{str(attendance.date): attendance.text_status for attendance in attendances},
                                **{f"{attendance.date} - comments": attendance.comment for attendance in attendances}}
                )

            return make_response_with_file(
                proxy, filename, "text/csv", encoding="utf-8-sig"
            )
