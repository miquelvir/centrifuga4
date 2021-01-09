from flask import current_app
from flask_restful import Resource
from rq.job import Job

from centrifuga4.auth_auth.action_need import EmailPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import PaymentsRecipesPermission, PaymentsPermission
from centrifuga4.blueprints.api.common.errors import NotFound
from centrifuga4.models import Payment
from email_queue.emails.payment_receipt_email import my_job
from centrifuga4 import q


class PaymentReceiptEmailCollectionRes(Resource):  # todo check
    @Requires(EmailPermission, PaymentsRecipesPermission, PaymentsPermission)
    def post(self, payment_id):
        query = Payment.query.filter_by(id=payment_id)
        payment: Payment = query.first()

        if not payment:
            raise NotFound("resource with the given id not found",
                           requestedId=payment_id)

        job = q.enqueue_call(
            func=my_job,
            args=(payment,
                  [guardian.email for guardian in payment.student[0].guardians if guardian.email]
                  + [payment.student[0].email],
                  current_app.config["PUBLIC_VALIDATION_SECRET"], current_app.config["BACKEND_SERVER_URL"]),
            result_ttl=5000
        )

        return job.get_id()
