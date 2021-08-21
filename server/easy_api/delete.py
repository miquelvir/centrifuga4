from server import db
from server.auth_auth.require import Require
from server.auth_auth.requires import Requires, assert_permissions
from server.easy_api._requires import EasyRequires
from server.blueprints.api.errors import NotFound
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsDeleteOne:
    """when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema

    def delete(self, id_):
        result = db.session.query(self.model).filter(self.model.id == id_).one_or_none()

        if not result:
            raise NotFound("resource with the given id not found", requestedId=id_)

        Require.ensure.delete(result)

        db.session.delete(result)
        db.session.commit()
