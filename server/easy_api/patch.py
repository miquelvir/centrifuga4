from typing import List

from flask import request

from server import db
from server.auth_auth.require import Require
from server.auth_auth.requires import Requires
from server.blueprints.api.errors import integrity, no_nested, safe_marshmallow
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


def safe_patch(function):
    """a safe patch is one with permission, and no nested patches"""

    @safe_marshmallow
    @no_nested
    @integrity
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)

    return decorator


class ImplementsPatchOne:
    """when used on an EasyResource, it implements the patch endpoint

    given an id, it patches it with the given body
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema
    privileges = List[str]

    @safe_patch
    def patch(self, id_):
        body = request.get_json()
        body["id"] = id_  # force id_

        updated_student = self.schema.load(body, partial=True)

        Require.ensure.update(updated_student)

        merged = db.session.merge(updated_student)

        # todo investigate
        """if not result:  
                    raise NotFound("resource with the given id not found", requestedId=id_)"""

        db.session.commit()

        return self.schema.dump(merged)
