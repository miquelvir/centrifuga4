import io

from flasgger import SwaggerView
from flask import current_app
from flask_login import login_required
from flask_restful import Resource

from server.auth_auth.require import Require
from server.auth_auth.special_permissions import PaymentReceiptsPermission

from server.blueprints.api.errors import NotFound
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Payment
from server.pdfs.payment_receipt import generate_payment_recipe_pdf
from server.schemas.schemas import PaymentSchema, StudentSchema


class PaymentsReceiptsRes(Resource, SwaggerView):  # todo documented class higher up
    @login_required
    def post(self, id_):
        Require.ensure.create(PaymentReceiptsPermission())

        query = Payment.query.filter(Payment.id == id_)
        payment: Payment = query.first()

        Require.ensure.read(payment)

        if not payment:
            raise NotFound("resource with the given id not found", requestedId=id_)

        pdf = generate_payment_recipe_pdf(
            current_app.config["PUBLIC_VALIDATION_SECRET"],
            PaymentSchema().dump(payment),
            StudentSchema().dump(payment.student),
            current_app.config["BACKEND_SERVER_URL"],
        )

        return make_response_with_file(
            io.BytesIO(pdf), "receipt-%s.pdf" % id_, "application/pdf"
        )
