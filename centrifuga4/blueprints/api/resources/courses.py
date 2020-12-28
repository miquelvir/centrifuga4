import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.auth_auth.resource_need import CoursesPermission
from centrifuga4.models import Course
from centrifuga4.schemas.schemas import CourseSchema


class CoursesRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = CourseSchema
    model = Course
    permissions = {CoursesPermission}


class CoursesCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = CourseSchema
    model = Course
    permissions = {CoursesPermission}
