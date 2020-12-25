from flask import request

import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.auth_auth.resource_need import UsersPermission
from centrifuga4.models import User
from centrifuga4.schemas.schemas import UserSchema

# todo not dump the password hash on api calls
class UsersRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = UserSchema
    model = User
    permissions = (UsersPermission,)

    def post(self, *args, **kwargs):

        body = request.get_json()
        if "password_hash" in body:
            body["password_hash"] = self.model.hash_password(body["password_hash"])
        elif "password" in body:
            body["password_hash"] = self.model.hash_password(body["password"])
            del body["password"]

        return super().post(*args, **kwargs)


class UsersCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = UserSchema
    model = User
    permissions = (UsersPermission,)
