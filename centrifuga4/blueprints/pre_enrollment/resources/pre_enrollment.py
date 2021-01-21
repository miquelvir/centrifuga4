import datetime
from threading import Thread

import jwt
from flask import request, current_app, jsonify
from flask_restful import Resource, abort

from centrifuga4 import db
from centrifuga4.models import User, Course, Student, Guardian
from centrifuga4.schemas.schemas import (
    PublicCourseSchema,
    StudentSchema,
    GuardianSchema,
)
from email_queue.emails.pre_enrollment_email import my_job

from email_queue.url_utils import merge_url_query_params


class PreEnrollment(Resource):
    def post(self):
        body = request.json

        guardians = body["guardians"]
        courses = body["courses"]
        del body["guardians"]
        del body["courses"]
        body["id"] = Student.generate_new_id()
        body["enrollment_status"] = "pre-enrolled"
        s: Student = StudentSchema().load(body)
        for course_id in courses:
            c = Course.query.filter_by(id=course_id).one_or_none()
            if not c:
                return 400, "no course found with id %s" % course_id
            s.courses.append(c)

        for guardian in guardians:
            guardian["id"] = Guardian.generate_new_id()
            g: Guardian = GuardianSchema().load(guardian)
            s.guardians.append(g)

        db.session.add(s)
        db.session.commit()

        thread = Thread(target=my_job, args=(s.official_notification_emails, s.id))
        thread.start()
