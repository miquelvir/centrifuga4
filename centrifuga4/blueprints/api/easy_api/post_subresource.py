from flask import abort

from centrifuga4 import db

from centrifuga4.blueprints.api.easy_api.post import safe_post
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsPostOneSubresource:
    """ when used on an EasyResource, it implements the post endpoint

    given an id, it posts with the given body
    """
    model: type(MyBase)  # todo add type everywhere
    schema: MySQLAlchemyAutoSchema
    parent_model: type(MyBase)
    parent_field: str

    @safe_post
    def post(self, id_, nested_id):  # todo test completeness
        # find the parent so that it can be added there
        query = self.parent_model.query.filter(self.parent_model.id == id_)
        parent = query.one_or_none()

        if not parent:
            abort(404, "no parent resource for id '%s' found" % id_)

        field = getattr(parent, self.parent_field)  # todo secure as get field

        added = self.model.query.filter(self.model.id == nested_id).one_or_none()

        if not added:
            abort(404, "no child resource for id '%s' found" % nested_id)

        field.append(added)

        db.session.commit()

        return None  # todo formalize
