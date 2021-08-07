from flask import Blueprint
from flask_restful import Api as Api

from server.blueprints.api.errors import Unauthorized, Forbidden
from server.errors.authorization import Forbidden as RawForbidden
from .resources.enrolment_email import EnrollmentEmailCollectionRes
from .resources.grant_email import GrantEmailCollectionRes
from .resources.payment_receipt_email import PaymentReceiptEmailCollectionRes
from .resources.bulk_email import BulkEmailCollectionRes

emails_blueprint = Blueprint("emails", __name__)


@emails_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(emails_blueprint)

api.add_resource(EnrollmentEmailCollectionRes, "/enrolmentEmail/<student_id>")
api.add_resource(GrantEmailCollectionRes, "/grantEmail/<student_id>")
api.add_resource(PaymentReceiptEmailCollectionRes, "/paymentReceipt/<payment_id>")
api.add_resource(BulkEmailCollectionRes, "/bulk")
