import io

from flasgger import SwaggerView
from flask import make_response, send_file, current_app
from flask_restful import Resource

from centrifuga4.auth_auth.action_need import PostPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import StudentsPermission
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models import Student
from pdfs.enrollment import generate_enrollment_agreement_pdf


class StudentsEnrollmentAgreementRes(
    Resource, SwaggerView
):  # todo documented class higher up
    @Requires(PostPermission, StudentsPermission)
    def post(self, id_):
        query = Student.query.filter_by(id=id_)
        student: Student = query.first()

        if not student:
            raise NotFound("resource with the given id not found", requestedId=id_)

        pdf = generate_enrollment_agreement_pdf(
            student.id, backend_server_address=current_app.config["BACKEND_SERVER_URL"]
        )
        r = make_response(
            send_file(
                io.BytesIO(pdf),
                as_attachment=True,
                mimetype="application/pdf",
                attachment_filename="enrollment-%s.pdf" % id_,
            )
        )
        r.headers["Access-Control-Expose-Headers"] = "content-disposition"

        return r
