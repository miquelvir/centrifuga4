import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import CoursesPermission, StudentsPermission
from centrifuga4.models import Course, Student
from centrifuga4.schemas.schemas import CourseSchema


class CoursesRes(easy.EasyResource,
                 easy.ImplementsGetOne,
                 easy.ImplementsPatchOne,
                 easy.ImplementsDeleteOne):
    schema = CourseSchema
    model = Course
    permissions = {CoursesPermission}


class CoursesCollectionRes(easy.EasyResource,
                           easy.ImplementsPostOne,
                           easy.ImplementsGetCollection):
    schema = CourseSchema
    model = Course
    permissions = {CoursesPermission}


class StudentCourseRes(easy.EasyResource,
                       easy.ImplementsDeleteOneSubresource,
                       easy.ImplementsPostOneSubresource):  # todo others if ok
    schema = CourseSchema
    model = Course

    parent_model = Student
    parent_field = 'courses'

    permissions = {CoursesPermission, StudentsPermission}

