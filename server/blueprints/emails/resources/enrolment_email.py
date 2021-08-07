from threading import Thread

from flask import current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server.auth_auth.action_need import EmailPermission
from server.auth_auth.requires import Requires
from server.auth_auth.resource_need import StudentsPermission
from server.blueprints.api.errors import NotFound
from server.models import Student
from server.emails.emails.enrolment_agreement_email import my_job


class EnrollmentEmailCollectionRes(Resource):
    @Requires(EmailPermission, StudentsPermission)
    def post(self, student_id):
        query = Student.query.filter(Student.id == student_id)
        student: Student = query.first()

        if not student:
            raise NotFound(
                "resource with the given id not found", requestedId=student_id
            )
        if student.price_term is None:
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
