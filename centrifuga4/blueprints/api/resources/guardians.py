import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import GuardiansPermission, StudentsPermission
from centrifuga4.models import Guardian, Student
from centrifuga4.schemas.schemas import GuardianSchema


class GuardiansRes(easy.EasyResource,
                   easy.ImplementsGetOne,
                   easy.ImplementsPatchOne,
                   easy.ImplementsDeleteOne):
    schema = GuardianSchema
    model = Guardian
    permissions = {GuardiansPermission}


class GuardiansCollectionRes(easy.EasyResource,
easy.ImplementsPostOne,
                             easy.ImplementsGetCollection):
    schema = GuardianSchema
    model = Guardian
    permissions = {GuardiansPermission}


class StudentGuardiansRes(easy.EasyResource,
                        easy.ImplementsPostOneSubresource):  # todo others if ok
    schema = GuardianSchema
    model = Guardian

    parent_model = Student
    parent_field = 'guardians'

    permissions = {GuardiansPermission, StudentsPermission}
