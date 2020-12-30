import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import CoursesPermission
from centrifuga4.models import Course
from centrifuga4.schemas.schemas import CourseSchema


class CoursesRes(easy.EasyResource,
                 easy.ImplementsGetOne,
                 easy.ImplementsPatchOne,
                 easy.ImplementsPostOne,
                 easy.ImplementsDeleteOne):
    schema = CourseSchema
    model = Course
    permissions = {CoursesPermission}


class CoursesCollectionRes(easy.EasyResource,
                           easy.ImplementsGetCollection):
    schema = CourseSchema
    model = Course
    permissions = {CoursesPermission}
