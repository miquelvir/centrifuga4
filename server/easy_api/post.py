from flask import request

from server import db
from server.auth_auth.requires import Requires

from server.blueprints.api.errors import (
    no_nested,
    safe_marshmallow,
    ResourceBaseBadRequest,
    integrity,
)
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


def safe_post(function):
    """a safe post is one with permissions and no nested objects"""

    @safe_marshmallow
    @no_nested
    @integrity
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)

    return decorator


class ImplementsPostOne:
    """when used on an EasyResource, it implements the post endpoint

    given an id, it posts with the given body
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema

    @safe_post
    def post(self):
        Requires().require(
            list(need.create().permission for need in self.model.permissions)
        )

        body = request.get_json()

        if "id" in body:
            raise ResourceBaseBadRequest(
                "post does not admit id argument",
                messages={"id": ["Found value '%s', expects no id." % body["id"]]},
            )

        new_id = self.model.generate_new_id()
        body["id"] = new_id

        new = self.schema.load(body)
        db.session.add(new)
        db.session.commit()

        return self.schema.dump(new)
