import io

from flasgger import SwaggerView
from flask import current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server.auth_auth.require import Require
from server.blueprints.api.errors import NotFound
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Student
from server.pdfs.enrolment import generate_enrolment_agreement_pdf


class StudentsEnrollmentAgreementRes(
    Resource, SwaggerView
):  # todo documented class higher up
    def post(self, id_):
        query = Student.query.filter(Student.id == id_)
        student: Student = query.first()

        Require.ensure.read(
            student
        )  # todo maybe special permissions for enrollment agreements and emails and so on

        if not student:
            raise NotFound("resource with the given id not found", requestedId=id_)
        if student.price_term is None:
            raise BadRequest("no price per term set")

        pdf = generate_enrolment_agreement_pdf(
            student.id, backend_server_address=current_app.config["BACKEND_SERVER_URL"]
        )

        return make_response_with_file(
            io.BytesIO(pdf), "enrolment-%s.pdf" % id_, "application/pdf"
        )
