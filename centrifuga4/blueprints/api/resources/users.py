import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_USERS
from centrifuga4.models import User
from centrifuga4.schemas import UserSchema


class UsersRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = UserSchema
    model = User
    privileges = (PRIVILEGE_RESOURCE_USERS,)


class UsersCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = UserSchema
    model = User
    privileges = (PRIVILEGE_RESOURCE_USERS,)
