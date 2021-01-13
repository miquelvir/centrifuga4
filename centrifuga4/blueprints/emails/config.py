from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from centrifuga4.blueprints.api.errors import Unauthorized, Forbidden
from centrifuga4.errors.authorization import Forbidden as RawForbidden
from .resources.enrollment_email import EnrollmentEmailCollectionRes
from .resources.grant_email import GrantEmailCollectionRes
from .resources.payment_receipt_email import PaymentReceiptEmailCollectionRes

emails_blueprint = Blueprint("emails", __name__)


@emails_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@emails_blueprint.errorhandler(RawForbidden)
def handle(e):
    raise Forbidden(e.message, **e.kwargs)


api = Api(emails_blueprint)

api.add_resource(EnrollmentEmailCollectionRes, "/enrollmentEmail/<student_id>")
api.add_resource(GrantEmailCollectionRes, "/grantEmail/<student_id>")
api.add_resource(PaymentReceiptEmailCollectionRes, "/paymentReceipt/<payment_id>")
