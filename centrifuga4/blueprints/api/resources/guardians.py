import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.auth_auth.resource_need import GuardiansPermission
from centrifuga4.models import Guardian
from centrifuga4.schemas.schemas import GuardianSchema


class GuardiansRes(easy.ImplementsEasyResource,
                   easy.ImplementsGetOne,
                   easy.ImplementsPatchOne,
                   easy.ImplementsPostOne,
                   easy.ImplementsDeleteOne):
    schema = GuardianSchema
    model = Guardian
    permissions = (GuardiansPermission,)


class GuardiansCollectionRes(easy.ImplementsEasyResource,
                             easy.ImplementsGetCollection):
    schema = GuardianSchema
    model = Guardian
    permissions = (GuardiansPermission,)
