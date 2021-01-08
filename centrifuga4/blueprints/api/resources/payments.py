import io
from datetime import datetime

import jwt
import pdfkit as pdfkit
from flasgger import SwaggerView
from flask import make_response, send_file, render_template, current_app
from flask_restful import Resource

import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.action_need import GetPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import PaymentsPermission, StudentsPermission, PaymentsRecipesPermission
from centrifuga4.blueprints.api.common.easy_api._content_negotiation import produces
from centrifuga4.blueprints.api.common.easy_api._requires import EasyRequires
from centrifuga4.blueprints.api.common.easy_api.get import safe_get
from centrifuga4.blueprints.api.common.errors import NotFound
from centrifuga4.models import Payment, Student
from centrifuga4.schemas.schemas import PaymentSchema


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
    @Requires(GetPermission, PaymentsPermission, PaymentsRecipesPermission)
    def get(self, id_):

        def unix_time_millis():
            epoch = datetime.utcfromtimestamp(0)
            return int((datetime.now() - epoch).total_seconds() * 1000.0)

        query = Payment.query.filter_by(id=id_)
        result: Payment = query.first()

        if not result:
            raise NotFound("resource with the given id not found",
                           requestedId=id_)

        config = pdfkit.configuration(wkhtmltopdf='/usr/bin/wkhtmltopdf')

        signing_at = unix_time_millis()
        try:
            student = result.student[0]
            student_name = student.full_name.title()
            student_id = student.id
        except IndexError:
            raise

        token = jwt.encode({'studentId': student_id,
                            'paymentId': result.id,
                            'studentName': student_name,
                            'paymentMethod': result.method,
                            'paymentDate': str(result.date),
                            'paymentQuantity': result.quantity,
                            "iat": signing_at},
                   current_app.config["PUBLIC_VALIDATION_SECRET"],
                   algorithm='HS256')

        pdf_content = render_template("payment_recipe.html",
                                      server_address=current_app.config["BACKEND_SERVER_URL"],
                                      full_name=student_name,
                                      quantity=result.quantity,
                                      date=result.date,
                                      method=result.method,
                                      today=datetime.date(datetime.now()),
                                      today_extended=signing_at,
                                      payment_id=result.id,
                                      verification_link="%s/validation/v1/%s" % (current_app.config["BACKEND_SERVER_URL"],
                                                                              token.decode('utf-8')))

        pdf = pdfkit.from_string(pdf_content, False,
                                 configuration=config)

        r = make_response(send_file(
            io.BytesIO(pdf),
            as_attachment=True,
            mimetype='application/pdf',
            attachment_filename='resulting.pdf'))
        r.headers["Access-Control-Expose-Headers"] = "content-disposition"

        return r