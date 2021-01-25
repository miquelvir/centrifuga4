import io

from flasgger import SwaggerView
from flask import make_response, send_file, current_app
from flask_restful import Resource

from centrifuga4.auth_auth.action_need import PostPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import (
    PaymentsPermission,
    PaymentsRecipesPermission,
)
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models import Payment
from pdfs.payment_receipt import generate_payment_recipe_pdf


class PaymentsReceiptsRes(Resource, SwaggerView):  # todo documented class higher up
    @Requires(PostPermission, PaymentsPermission, PaymentsRecipesPermission)
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

        r = make_response(
            send_file(
                io.BytesIO(pdf),
                as_attachment=True,
                mimetype="application/pdf",
                attachment_filename="receipt-%s.pdf" % id_,
            )
        )
        r.headers["Access-Control-Expose-Headers"] = "content-disposition"

        return r
