import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import TeachersPermission
from centrifuga4.models import Teacher
from centrifuga4.schemas.schemas import TeacherSchema


class TeachersRes(easy.EasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = TeacherSchema
    model = Teacher
    permissions = {TeachersPermission}


class TeachersCollectionRes(easy.EasyResource,
                         easy.ImplementsGetCollection):
    schema = TeacherSchema
    model = Teacher
    permissions = {TeachersPermission}
