from centrifuga4 import db
from centrifuga4.easy_api.delete import safe_delete
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsDeleteOneSubresource:
    """ when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """
    model: MyBase
    schema: MySQLAlchemyAutoSchema
    parent_model: type(MyBase)
    parent_field: str

    @safe_delete
    def delete(self, id_, nested_id):
        parent = self.parent_model.query.filter(self.parent_model.id == id_).one_or_none()

        if not parent:
            raise NotFound("resource with the given id not found", requestedId=id_)

        field = getattr(parent, self.parent_field)  # todo secure as get field

        index = next(i for i, v in enumerate(field) if v.id == nested_id)
        if index is None:
            raise NotFound("id '%s' not found in parent resource" % nested_id)

        field.pop(index)

        db.session.commit()

