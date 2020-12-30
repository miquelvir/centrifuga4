import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import GuardiansPermission
from centrifuga4.models import Guardian
from centrifuga4.schemas.schemas import GuardianSchema


class GuardiansRes(easy.EasyResource,
                   easy.ImplementsGetOne,
                   easy.ImplementsPatchOne,
                   easy.ImplementsPostOne,
                   easy.ImplementsDeleteOne):
    schema = GuardianSchema
    model = Guardian
    permissions = {GuardiansPermission}


class GuardiansCollectionRes(easy.EasyResource,
                             easy.ImplementsGetCollection):
    schema = GuardianSchema
    model = Guardian
    permissions = {GuardiansPermission}
