import csv
from datetime import datetime, timedelta
import io
from typing import List, Dict

from flasgger import SwaggerView
from flask import request, jsonify
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server import db
from server.auth_auth.action_need import PostPermission
from server.auth_auth.requires import Requires
from server.auth_auth.resource_need import (
    StudentsPermission,
    CoursesPermission,
    AttendancePermission,
)
from server.blueprints.api.errors import NotFound
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Course, Attendance, Student


class CoursesAttendanceRes(Resource, SwaggerView):
    @Requires(PostPermission, AttendancePermission)
    def get(self, id_):
        print(id_)
        query = Course.query.filter(Course.id == id_)
        course: Course = query.first()

        print("x1")

        if not course:
            print("x33")
            raise NotFound("resource with the given id not found", requestedId=id_)

        try:
            date = datetime.strptime(request.args["date"], "%Y-%m-%d").date()
        except KeyError:
            date = None

        attendances = list(course.get_attendance(date))
        print(course.attendances)
        print("ATTS", attendances)
        result = {}
        for attendance in attendances:
            date_as_string = attendance.date.strftime("%Y-%m-%d")
            if date_as_string not in result:
                result[date_as_string] = []
            result[date_as_string].append(attendance.student_id)

        if date:
            date_as_string = date.strftime("%Y-%m-%d")
            if date_as_string not in result:
                result[date_as_string] = []
                print("x")

        print(date)
        return jsonify([{"date": date, "student_ids": l} for date, l in result.items()])

    @Requires(PostPermission, AttendancePermission)
    def put(self, id_):
        query = Course.query.filter(Course.id == id_)
        course: Course = query.first()

        if not course:
            raise NotFound("resource with the given id not found", requestedId=id_)

        try:
            date = datetime.strptime(request.json["date"], "%Y-%m-%d").date()
        except KeyError:
            raise BadRequest("no date field found")

        try:
            student_ids = request.json["students"]
        except KeyError:
            raise BadRequest("no students field found")

        query = Student.query.filter(Student.id.in_(student_ids))
        correct_ids: int = query.count()

        print(correct_ids, len(student_ids))
        if correct_ids != len(student_ids):
            raise BadRequest("some provided student_id is not correct")

        query = Attendance.query.filter(Attendance.course_id == id_)
        attendances: List[Attendance] = query.all()
        attendances: Dict[str, Attendance] = {a.student_id: a for a in attendances}
        current_attended_student_ids = set(attendances.keys())
        new_student_ids = set(student_ids)
        to_be_removed_student_ids = current_attended_student_ids - new_student_ids
        to_be_added_student_ids = new_student_ids - current_attended_student_ids
        for sid in to_be_removed_student_ids:
            db.session.delete(attendances[sid])

        for student_id in to_be_added_student_ids:
            db.session.add(
                Attendance(date=date, student_id=student_id, course_id=course.id)
            )

        db.session.commit()

        return ""
