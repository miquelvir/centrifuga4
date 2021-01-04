from flask import request, jsonify, abort

from centrifuga4 import db
from centrifuga4.auth_auth.action_need import PostPermission

from centrifuga4.blueprints.api.common.easy_api._requires import EasyRequires
from centrifuga4.blueprints.api.common.easy_api.post import safe_post
from centrifuga4.blueprints.api.common.errors import no_nested, safe_marshmallow, ResourceBaseBadRequest
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsPostOneSubresource:
    """ when used on an EasyResource, it implements the post endpoint

    given an id, it posts with the given body
    """
    model: MyBase
    schema: MySQLAlchemyAutoSchema
    parent_model: MyBase
    parent_field: str

    @safe_post
    def post(self, id_):  # todo test completeness
        body = request.get_json()
        if "id" in body:
            raise ResourceBaseBadRequest("post does not admit id argument",
                                         messages={"id": ["Found value '%s', expects no id." % body["id"]]})

        # find the parent so that it can be added there
        query = self.parent_model.query.filter(self.parent_model.id == id_)
        parent = query.first()

        if not parent:
            abort(404, "no parent resource for id '%s' found" % id_)

        field = getattr(parent, self.parent_field)  # todo secure as get field

        new_id = self.model.generate_new_id()
        body["id"] = new_id

        new = self.schema.load(body)

        field.append(new)

        db.session.add(new)
        db.session.commit()

        return new_id
