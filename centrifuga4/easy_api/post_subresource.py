from flask import abort

from centrifuga4 import db
from centrifuga4.easy_api._subresource_utils import get_subresource, get_parent

from centrifuga4.easy_api.post import safe_post
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsPostOneSubresource:
    """when used on an EasyResource, it implements the post endpoint

    given an id, it posts with the given body
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema
    parent_model: type(MyBase)
    parent_field: str

    @safe_post
    def post(self, id_, nested_id):
        # find the parent so that it can be added there
        parent = get_parent(self.parent_model, id_)
        field = getattr(parent, self.parent_field)

        added = self.model.query.filter(self.model.id == nested_id).one_or_none()

        if not added:
            abort(404, "no child resource for id '%s' found" % nested_id)

        field.append(added)

        db.session.commit()

        return self.schema.dump(added)  # todo use super, same in delete
