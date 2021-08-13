from threading import Thread

from flask import current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server.auth_auth.new_needs import EmailNeed, StudentsNeed
from server.auth_auth.requires import Requires, assert_permissions
from server.blueprints.api.errors import NotFound
from server.models import Student
from server.emails.emails.grant_letter_email import my_job


class GrantEmailCollectionRes(Resource):
    def post(self, student_id):
        assert_permissions(EmailNeed.create(), StudentsNeed.read(student_id))

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
