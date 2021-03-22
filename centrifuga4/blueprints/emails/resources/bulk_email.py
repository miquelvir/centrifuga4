import json
from io import BytesIO
from threading import Thread
from typing import List

from flask import current_app, request
from flask_restful import Resource
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import BadRequest

from centrifuga4.auth_auth.action_need import EmailPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import StudentsPermission, CoursesPermission
from centrifuga4.models import Student, Course
from email_queue.emails.bulk_email import my_job


class BulkEmailCollectionRes(Resource):
    @Requires(EmailPermission, StudentsPermission, CoursesPermission)
    def post(self):
        try:
            course_ids = json.loads(request.form["courseIds"])
        except KeyError:
            return "no courseIds found in body", 400
        except ValueError:
            return "invalid json format for courseIds found in body", 400

        try:
            email_preference = request.form["emailPreference"]
        except KeyError:
            return "no emailPreference found in body", 400

        try:
            subject = request.form["subject"]
        except KeyError:
            return "no subject found in body", 400

        try:
            body = request.form["body"]
        except KeyError:
            return "no body found in body", 400

        VALID_EMAIL_PREFERENCE = ("contacts", "resolved", "student", "all")
        if email_preference not in VALID_EMAIL_PREFERENCE:
            return "invalid emailPreference, must be one of %s and was '%s'" % (
                VALID_EMAIL_PREFERENCE,
                email_preference,
            )

        query = Course.query.filter(Course.id.in_(course_ids))
        courses: List[Course] = query.all()

        emails = []
        for course in courses:
            for student in course.students:
                if email_preference == "resolved":
                    emails.extend(student.official_notification_emails)
                elif email_preference == "student":
                    emails.append(student.email)
                elif email_preference == "contacts":
                    emails.extend(student.contact_emails)
                elif email_preference == "all":
                    emails.extend(student.all_emails)

        thread = Thread(
            target=my_job,
            args=(
                emails,
                subject,
                body,
                [
                    (BytesIO(file.stream.read()), name)
                    for name, file in request.files.items()
                ],
            ),
        )
        thread.start()

        return ""
