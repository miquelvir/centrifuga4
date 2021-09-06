from threading import Thread

from flask import current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server.auth_auth.require import Require
from server.auth_auth.special_permissions import EmailPermission
from server.blueprints.api.errors import NotFound
from server.models import Student
from server.email_notifications.enrolment_agreement import (
    send_enrolment_agreement_email,
)
from server.schemas.schemas import StudentSchema


class EnrollmentEmailCollectionRes(Resource):
    def post(self, student_id):
        Require.ensure.create(EmailPermission())

        query = Student.query.filter(Student.id == student_id)
        student: Student = query.first()

        Require.ensure.read(student)

        if not student:
            raise NotFound(
                "resource with the given id not found", requestedId=student_id
            )
        if student.price_term is None:
            raise BadRequest("no 'price per term' set")

        thread = Thread(
            target=send_enrolment_agreement_email,
            args=(
                StudentSchema().dump(student),
                current_app.config["BACKEND_SERVER_URL"],
            ),
        )
        thread.start()

        return ""
