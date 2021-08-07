from server import db
from server.auth_auth.action_need import DeletePermission
from server.easy_api._requires import EasyRequires
from server.blueprints.api.errors import NotFound
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


def safe_delete(function):
    """ a safe delete is one with permissions to delete """

    @EasyRequires(DeletePermission)
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)

    return decorator


class ImplementsDeleteOne:
    """when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema

    @safe_delete
    def delete(self, id_):
        result = db.session.query(self.model).filter(self.model.id == id_).one_or_none()

        if not result:
            raise NotFound("resource with the given id not found", requestedId=id_)

        db.session.delete(result)
        db.session.commit()
