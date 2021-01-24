import csv
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
from centrifuga4.constants import SHORT_NAME
from centrifuga4.models import Student, Course, Schedule
from pdfs.enrollment import generate_enrollment_agreement_pdf


class CoursesAttendanceListRes(Resource, SwaggerView):
    @Requires(PostPermission, CoursesPermission, StudentsPermission)
    def post(self, id_):

        query = Course.query.filter(Course.id == id_)
        course: Course = query.first()

        if not course:
            raise NotFound("resource with the given id not found", requestedId=id_)

        try:
            first = request.args["startDate"]
        except KeyError:
            raise BadRequest("startDate not found")

        try:
            last = request.args["endDate"]
        except KeyError:
            raise BadRequest("endDate not found")

        try:
            first = datetime.strptime(first, "%Y-%m-%d")
        except ValueError:
            raise BadRequest("startDate should use ISO Date format: %Y-%m-%d")

        try:
            last = datetime.strptime(last, "%Y-%m-%d")
        except ValueError:
            raise BadRequest("endDate should use ISO Date format: %Y-%m-%d")

        working_days = []
        for base_schedule in course.base_schedules:
            if first.weekday() < base_schedule.day_week:
                # 0 < 2
                current_date = first + timedelta(
                    days=7 + base_schedule.day_week - first.weekday()
                )
            else:
                current_date = first

            current_date = datetime.combine(current_date, base_schedule.start_time)

            while current_date < last:
                working_days.append(current_date)
                current_date += timedelta(days=7)

        working_days.sort()
        working_days = [str(wd) for wd in working_days]

        filename = "%s-export-attendance-%s-%s.csv" % (
            SHORT_NAME,
            course.id,
            datetime.now().strftime("%Y%m%dT%H%M%S"),
        )

        proxy = io.StringIO()

        with proxy as fr:
            spamwriter = csv.writer(fr)
            spamwriter.writerow(["id >", course.id])
            spamwriter.writerow(["nom / nombre / name >", course.name])
            spamwriter.writerow(
                ["descripció / descripción / description >", course.description]
            )
            spamwriter.writerow(
                [
                    "id",
                    "nom / nombre / name",
                    "primer cognom / primer apellido / first surname",
                    "segon cognom / segundo apellido / second surname",
                ]
                + working_days
            )
            for student in course.students:
                if student.is_enrolled:
                    spamwriter.writerow(
                        [student.id, student.name, student.surname1, student.surname2]
                    )

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
