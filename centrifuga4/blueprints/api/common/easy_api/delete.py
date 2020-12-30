from centrifuga4 import db
from centrifuga4.auth_auth.action_need import DeletePermission
from centrifuga4.blueprints.api.common.easy_api._requires import EasyRequires
from centrifuga4.blueprints.api.common.errors import NotFound
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


def safe_delete(function):
    """ a safe delete is one with permissions to delete """
    @EasyRequires(DeletePermission)
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)
    return decorator


class ImplementsDeleteOne:
    """ when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """
    model: MyBase
    schema: MySQLAlchemyAutoSchema

    @safe_delete
    def delete(self, id_):
        result = db.session.query(self.model).filter_by(id=id_).one_or_none()

        # todo subresources decide
        """delete_guardians = request.args.get('deleteGuardians')  
        if delete_guardians:
            delete_guardians = bool(int(delete_guardians))
            if delete_guardians:
                for guardian in student.guardians:
                    db.session.delete(guardian)"""
        if not result:
            raise NotFound("resource with the given id not found", requestedId=id_)

        db.session.delete(result)
        db.session.commit()

