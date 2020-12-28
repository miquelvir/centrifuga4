import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.auth_auth.resource_need import PaymentsPermission
from centrifuga4.models import Payment
from centrifuga4.schemas.schemas import PaymentSchema


class PaymentsRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = PaymentSchema
    model = Payment
    permissions = {PaymentsPermission}


class PaymentsCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = PaymentSchema
    model = Payment
    permissions = {PaymentsPermission}
