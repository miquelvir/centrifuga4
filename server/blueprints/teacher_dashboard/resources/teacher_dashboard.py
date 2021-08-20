from server.auth_auth.requires import Requires
from server.easy_api._subresource_utils import get_parent
from server.easy_api.get import _ImplementsGet
from server.models import (
    Course,
    Teacher,
)
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema, CourseSchema
from server import easy_api as easy


class MyImplementsGetCollection(_ImplementsGet):
    """get all items of a resource"""

    model: MyBase
    schema: MySQLAlchemyAutoSchema

    def get(self, *args, **kwargs):
        return super().get(*args, many=True, **kwargs)


class MyImplementsGetCollectionSubresource(MyImplementsGetCollection):
    """when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema
    parent_model: type(MyBase)
    parent_field: str

    def get(self, id_, *args, **kwargs):
        parent = get_parent(self.parent_model, id_)

        Requires().require(
            list(need.read(id_).permission for need in self.parent_model.permissions)
        )

        return super().get(*args, parent=parent, **kwargs)


class TeacherDashboardResource(MyImplementsGetCollectionSubresource, easy.EasyResource):
    """when used on an EasyResource, it implements the delete endpoint

    given an id, it deletes that entry
    """

    model: type(MyBase) = Course
    schema: MySQLAlchemyAutoSchema = CourseSchema
    parent_model: type(MyBase) = Teacher
    parent_field: str = "courses"
    permissions: str = []
