from threading import Thread

import marshmallow
from flask import request
from flask_restful import Resource

from server import db
from server.auth_auth.recaptcha import validate_recaptcha
from server.models import Course, Student, Guardian
from server.schemas.schemas import StudentSchema, GuardianSchema
from server.emails.emails.pre_enrolment_email import my_job


class PreEnrollment(Resource):
    def post(self):
        recaptcha = request.json["recaptcha"]

        validate_recaptcha(recaptcha)

        body = request.json["body"]

        guardians = body["guardians"]
        courses = body["courses"]
        del body["guardians"]
        del body["courses"]
        body["id"] = Student.generate_new_id()
        body["enrolment_status"] = "pre-enrolled"

        try:
            s: Student = StudentSchema().load(body)
            for course_id in courses:
                c = Course.query.filter(Course.id == course_id).one_or_none()
                if not c:
                    return 400, "no course found with id %s" % course_id
                s.courses.append(c)

            for guardian in guardians:
                guardian["id"] = Guardian.generate_new_id()
                g: Guardian = GuardianSchema().load(guardian)
                s.guardians.append(g)
        except marshmallow.exceptions.ValidationError as e:
            return 400, "invalid request: " + str(e)
        db.session.add(s)
        db.session.commit()

        thread = Thread(target=my_job, args=(s.official_notification_emails, s.id))
        thread.start()
