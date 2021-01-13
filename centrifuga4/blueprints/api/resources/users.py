from flask import request

from centrifuga4 import easy_api as easy
from centrifuga4.auth_auth.resource_need import UsersPermission
from centrifuga4.models import User
from centrifuga4.schemas.schemas import UserSchema


class UsersRes(
    easy.EasyResource,
    easy.ImplementsGetOne,
    easy.ImplementsPatchOne,
    easy.ImplementsDeleteOne,
):
    schema = UserSchema
    model = User
    permissions = {UsersPermission}

    def post(self, *args, **kwargs):

        body = request.get_json()
        if "password_hash" in body:
            body["password_hash"] = self.model.hash_password(body["password_hash"])
        elif "password" in body:
            body["password_hash"] = self.model.hash_password(body["password"])
            del body["password"]

        return super().post(*args, **kwargs)
