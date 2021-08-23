from server import db
from server.auth_auth.require import Require
from server.easy_api._subresource_utils import get_parent
from server.blueprints.api.errors import NotFound
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsDeleteOneSubresource:
    """when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema
    parent_model: type(MyBase)
    parent_field: str

    def delete(self, id_, nested_id):
        parent = get_parent(self.parent_model, id_)
        field = getattr(parent, self.parent_field)

        index = None
        for idx, v in enumerate(field):
            if v.id == nested_id:
                index = idx

                Require.ensure.delete(v)
                break

        if index is None:
            raise NotFound("id '%s' not found in parent resource" % nested_id)

        field.pop(index)

        db.session.commit()
