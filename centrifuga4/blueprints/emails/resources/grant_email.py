from threading import Thread

from flask import current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from centrifuga4.auth_auth.action_need import EmailPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import StudentsPermission
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models import Student
from email_queue.emails.grant_letter_email import my_job


class GrantEmailCollectionRes(Resource):
    @Requires(EmailPermission, StudentsPermission)
    def post(self, student_id):
        query = Student.query.filter(Student.id == student_id)
        student: Student = query.first()

        if not student:
            raise NotFound(
                "resource with the given id not found", requestedId=student_id
            )
        if not student.price_term:
            raise BadRequest("no price per term set")

        thread = Thread(
            target=my_job,
            args=(
                student,
                student.official_notification_emails,
                current_app.config["BACKEND_SERVER_URL"],
            ),
        )
        thread.start()

        return ""
