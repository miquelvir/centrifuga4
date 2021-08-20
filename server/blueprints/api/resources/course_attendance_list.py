import csv
from datetime import datetime, timedelta
import io

from flasgger import SwaggerView
from flask import request
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server.auth_auth.new_needs import CoursesNeed
from server.auth_auth.requires import Requires, assert_permissions
from server.blueprints.api.errors import NotFound
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Course

# todo check status etc
class CoursesAttendanceListRes(Resource, SwaggerView):
    def post(self, id_):
        assert_permissions((CoursesNeed.read(id_), ))

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

        with io.StringIO() as proxy:
            writer = csv.writer(proxy)
            writer.writerow(["id >", course.id])
            writer.writerow(["nom / nombre / name >", course.name])
            writer.writerow(
                ["descripció / descripción / description >", course.description]
            )
            writer.writerow(["nom / nombre / name"] + working_days)
            for student in course.students:
                if student.is_enrolled:
                    writer.writerow([student.full_name])

            return make_response_with_file(
                proxy, filename, "text/csv", encoding="utf-8-sig"
            )
