import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_PAYMENTS
from centrifuga4.models import Payment
from centrifuga4.schemas import PaymentSchema


class PaymentsRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = PaymentSchema
    model = Payment
    privileges = (PRIVILEGE_RESOURCE_PAYMENTS,)


class PaymentsCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = PaymentSchema
    model = Payment
    privileges = (PRIVILEGE_RESOURCE_PAYMENTS,)
