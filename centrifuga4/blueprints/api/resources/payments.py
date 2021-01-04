import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import PaymentsPermission, StudentsPermission
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
