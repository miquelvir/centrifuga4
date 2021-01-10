import io
from datetime import datetime

import jwt
import pdfkit as pdfkit
from flasgger import SwaggerView
from flask import make_response, send_file, render_template, current_app
from flask_restful import Resource

import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.action_need import GetPermission, PostPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import PaymentsPermission, StudentsPermission, PaymentsRecipesPermission
from centrifuga4.blueprints.api.common.errors import NotFound
from centrifuga4.models import Payment, Student
from centrifuga4.schemas.schemas import PaymentSchema
from pdfs.payment_receipt import generate_payment_recipe_pdf


class PaymentsRes(easy.EasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsDeleteOne):
    schema = PaymentSchema
    model = Payment
    permissions = {PaymentsPermission}


class PaymentsCollectionRes(easy.EasyResource,
                            easy.ImplementsPostOne,
                         easy.ImplementsGetCollection):
    schema = PaymentSchema
    model = Payment
    permissions = {PaymentsPermission}


class StudentPaymentsRes(easy.EasyResource,
                        easy.ImplementsPostOneSubresource):  # todo others if ok
    schema = PaymentSchema
    model = Payment

    parent_model = Student
    parent_field = 'payments'

    permissions = {PaymentsPermission, StudentsPermission}


class PaymentsRecipesRes(Resource, SwaggerView):  # todo documented class higher up
    @Requires(PostPermission, PaymentsPermission, PaymentsRecipesPermission)
    def post(self, id_):
        query = Payment.query.filter_by(id=id_)
        payment: Payment = query.first()

        if not payment:
            raise NotFound("resource with the given id not found",
                           requestedId=id_)

        pdf = generate_payment_recipe_pdf(current_app.config["PUBLIC_VALIDATION_SECRET"],
                                          payment,
                                          current_app.config["BACKEND_SERVER_URL"])

        r = make_response(send_file(
            io.BytesIO(pdf),
            as_attachment=True,
            mimetype='application/pdf',
            attachment_filename='receipt-%s.pdf' % id_))
        r.headers["Access-Control-Expose-Headers"] = "content-disposition"

        return r
