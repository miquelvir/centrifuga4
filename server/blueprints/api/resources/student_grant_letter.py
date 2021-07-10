import io

from flasgger import SwaggerView
from flask import current_app
from flask_restful import Resource
from werkzeug.exceptions import BadRequest

from server.auth_auth.action_need import PostPermission
from server.auth_auth.requires import Requires
from server.auth_auth.resource_need import StudentsPermission
from server.blueprints.api.errors import NotFound
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Student
from server.pdfs.grant_letter import generate_grant_letter_pdf


class StudentsGrantLettersRes(Resource, SwaggerView):  # todo documented class higher up
    @Requires(PostPermission, StudentsPermission)
    def post(self, id_):
        query = Student.query.filter(Student.id == id_)
        student: Student = query.first()

        if not student:
            raise NotFound("resource with the given id not found", requestedId=id_)
        if not student.price_term:
            raise BadRequest("no price per term set")

        pdf = generate_grant_letter_pdf(
            student.id, backend_server_address=current_app.config["BACKEND_SERVER_URL"]
        )

        return make_response_with_file(
            io.BytesIO(pdf), "grants-%s.pdf" % id_, "application/pdf"
        )
