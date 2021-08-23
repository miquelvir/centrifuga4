from threading import Thread

from flask import current_app
from flask_restful import Resource

from server.auth_auth.require import Require
from server.auth_auth.special_permissions import EmailPermission

from server.blueprints.api.errors import NotFound
from server.models import Payment
from server.emails.emails.payment_receipt_email import my_job


class PaymentReceiptEmailCollectionRes(Resource):
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
            target=my_job,
            args=(
                payment,
                payment.student.official_notification_emails,
                current_app.config["PUBLIC_VALIDATION_SECRET"],
                current_app.config["BACKEND_SERVER_URL"],
            ),
        )
        thread.start()

        return ""
