from flask import request, jsonify

from centrifuga4 import db
from centrifuga4.auth_auth.action_need import PostPermission

from centrifuga4.blueprints.api.common.easy_api._requires import EasyRequires
from centrifuga4.blueprints.api.common.errors import no_nested, safe_marshmallow, ResourceBaseBadRequest
from centrifuga4.models._base import MyBase
from centrifuga4.models.raw_person import RawPerson
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


def safe_post(function):
    """ a safe post is one with permissions and no nested objects """
    @EasyRequires(PostPermission)
    @safe_marshmallow  # todo check
    @no_nested
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)

    return decorator


class ImplementsPostOne:
    """ when used on an EasyResource, it implements the post endpoint

    given an id, it posts with the given body
    """
    model: MyBase
    schema: MySQLAlchemyAutoSchema

    @safe_post
    def post(self):  # todo test completeness
        body = request.get_json()
        if "id" in body:
            raise ResourceBaseBadRequest("post does not admit id argument",
                                         messages={"id": ["Found value '%s', expects no id." % body["id"]]})

        new_id = self.model.generate_new_id()
        body["id"] = new_id

        """if "guardians" in body:
            used_uncommitted_ids = [new_id]
            for guardian in body["guardians"]:
                guardian_id = generate_new_person_id(db, avoid=used_uncommitted_ids)
                guardian["id"] = guardian_id
                used_uncommitted_ids.append(guardian_id)"""

        new = self.schema.load(body)
        db.session.add(new)
        db.session.commit()

        return new_id
