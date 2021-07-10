from server.easy_api._subresource_utils import get_parent
from server.easy_api.get import ImplementsGetCollection
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


class ImplementsGetCollectionSubresource(ImplementsGetCollection):
    """when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema
    parent_model: type(MyBase)
    parent_field: str

    def get(self, id_, *args, **kwargs):
        parent = get_parent(self.parent_model, id_)

        return super().get(*args, parent=parent, **kwargs)
