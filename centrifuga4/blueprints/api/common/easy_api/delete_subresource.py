from centrifuga4 import db
from centrifuga4.auth_auth.action_need import DeletePermission
from centrifuga4.blueprints.api.common.easy_api._requires import EasyRequires
from centrifuga4.blueprints.api.common.easy_api.delete import safe_delete
from centrifuga4.blueprints.api.common.errors import NotFound
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
    def delete(self, id_, id2):
        parent = self.parent_model.query.filter(self.parent_model.id == id_).one_or_none()

        if not parent:
            raise NotFound("resource with the given id not found", requestedId=id_)

        field = getattr(parent, self.parent_field)  # todo secure as get field

        index = next(i for i, v in enumerate(field) if v.id == id2)
        if not index:
            raise NotFound("id '%s' not found in parent resource" % id2)

        field.pop(index)

        db.session.commit()

