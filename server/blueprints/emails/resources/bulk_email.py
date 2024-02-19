import json
from io import BytesIO
from threading import Thread
from typing import List

from flask import request, current_app
from flask_login import login_required
from flask_restful import Resource

from server.auth_auth.require import Require
from server.auth_auth.special_permissions import EmailPermission
from server.models import Course
from server.email_notifications.bulk_email import send_bulk_email
from server.models.student import EnrolmentStatus

from server.services.audit_service import audit_log_info


class BulkEmailCollectionRes(Resource):
    @login_required
    def post(self):
        Require.ensure.create(EmailPermission())

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
            student_status = request.form["studentEnrolmentStatus"]
        except KeyError:
            student_status = EnrolmentStatus.enrolled  # default

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
            Require.ensure.read(course)

            for student in course.students:
                if (
                    student_status is not None
                    and student.enrolment_status != student_status
                ):
                    continue  # skip this student
                Require.ensure.read(student)

                if email_preference == "resolved":
                    emails.extend(student.official_notification_emails)
                elif email_preference == "student":
                    emails.append(student.email)
                elif email_preference == "contacts":
                    emails.extend(student.contact_emails)
                elif email_preference == "all":
                    emails.extend(student.all_emails)

        audit_log_info(f"Sending {len(emails)} emails")
        
        thread = Thread(
            target=send_bulk_email,
            args=(
                emails,
                subject,
                body,
                [
                    (BytesIO(file.stream.read()), name)
                    for name, file in request.files.items()
                ],
                current_app.config.copy(),
            ),
        )
        thread.start()

        return ""
