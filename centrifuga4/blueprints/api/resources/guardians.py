import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_GUARDIANS
from centrifuga4.models import Guardian
from centrifuga4.schemas import GuardianSchema


class GuardiansRes(easy.ImplementsEasyResource,
                   easy.ImplementsGetOne,
                   easy.ImplementsPatchOne,
                   easy.ImplementsPostOne,
                   easy.ImplementsDeleteOne):
    schema = GuardianSchema
    model = Guardian
    privileges = (PRIVILEGE_RESOURCE_GUARDIANS,)


class GuardiansCollectionRes(easy.ImplementsEasyResource,
                             easy.ImplementsGetCollection):
    schema = GuardianSchema
    model = Guardian
    privileges = (PRIVILEGE_RESOURCE_GUARDIANS,)
