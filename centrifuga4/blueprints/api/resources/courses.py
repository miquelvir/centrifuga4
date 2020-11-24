import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_COURSES
from centrifuga4.models import Course
from centrifuga4.schemas import CourseSchema


class CoursesRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = CourseSchema
    model = Course
    privileges = (PRIVILEGE_RESOURCE_COURSES,)


class CoursesCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = CourseSchema
    model = Course
    privileges = (PRIVILEGE_RESOURCE_COURSES,)
