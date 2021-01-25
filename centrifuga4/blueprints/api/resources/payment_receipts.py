import io

from flasgger import SwaggerView
from flask import current_app
from flask_restful import Resource

from centrifuga4.auth_auth.action_need import PostPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import (
    PaymentsPermission,
    PaymentsReceiptsPermission,
)
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.file_utils.string_bytes_io import make_response_with_file
from centrifuga4.models import Payment
from pdfs.payment_receipt import generate_payment_recipe_pdf


class PaymentsReceiptsRes(Resource, SwaggerView):  # todo documented class higher up
    @Requires(PostPermission, PaymentsPermission, PaymentsReceiptsPermission)
    def post(self, id_):
        query = Payment.query.filter(Payment.id == id_)
        payment: Payment = query.first()

        if not payment:
            raise NotFound("resource with the given id not found", requestedId=id_)

        pdf = generate_payment_recipe_pdf(
            current_app.config["PUBLIC_VALIDATION_SECRET"],
            payment,
            current_app.config["BACKEND_SERVER_URL"],
        )

        return make_response_with_file(
            io.BytesIO(pdf), "receipt-%s.pdf" % id_, "application/pdf"
        )
