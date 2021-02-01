from threading import Thread

from flask import current_app
from flask_restful import Resource

from centrifuga4.auth_auth.action_need import EmailPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import (
    PaymentsReceiptsPermission,
    PaymentsPermission,
)
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models import Payment
from email_queue.emails.payment_receipt_email import my_job


class PaymentReceiptEmailCollectionRes(Resource):
    @Requires(EmailPermission, PaymentsReceiptsPermission, PaymentsPermission)
    def post(self, payment_id):
        query = Payment.query.filter(Payment.id == payment_id)
        payment: Payment = query.first()

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
