from threading import Thread

from flask import current_app
from flask_login import login_required
from flask_restful import Resource

from server.auth_auth.require import Require
from server.auth_auth.special_permissions import EmailPermission

from server.blueprints.api.errors import NotFound
from server.models import Payment
from server.email_notifications.payment_receipt import send_payment_receipt_email
from server.schemas.schemas import PaymentSchema, StudentSchema


class PaymentReceiptEmailCollectionRes(Resource):
    @login_required
    def post(self, payment_id):
        Require.ensure.create(EmailPermission())

        query = Payment.query.filter(Payment.id == payment_id)
        payment: Payment = query.first()

        Require.ensure.read(payment)

        if not payment:
            raise NotFound(
                "resource with the given id not found", requestedId=payment_id
            )

        thread = Thread(
            target=send_payment_receipt_email,
            args=(
                PaymentSchema().dump(payment),
                StudentSchema().dump(payment.student),
                current_app.config["PUBLIC_VALIDATION_SECRET"],
                current_app.config["BACKEND_SERVER_URL"],
                current_app.config.copy(),
            ),
        )
        thread.start()

        return ""
