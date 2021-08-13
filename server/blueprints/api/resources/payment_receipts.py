import io

from flasgger import SwaggerView
from flask import current_app
from flask_restful import Resource

from server.auth_auth.new_needs import PaymentsNeed
from server.auth_auth.requires import Requires, assert_permissions

from server.blueprints.api.errors import NotFound
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Payment
from server.pdfs.payment_receipt import generate_payment_recipe_pdf


class PaymentsReceiptsRes(Resource, SwaggerView):  # todo documented class higher up
    def post(self, id_):
        assert_permissions((PaymentsNeed.read(), PaymentsNeed.make_receipts()))
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
