from flasgger import swag_from

import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_STUDENTS
from centrifuga4.models import Student
from centrifuga4.schemas import StudentSchema


class StudentsRes(easy.ImplementsEasyResource,
                  easy.ImplementsGetOne,
                  easy.ImplementsPatchOne,
                  easy.ImplementsPostOne,
                  easy.ImplementsDeleteOne):
    schema = StudentSchema
    model = Student
    privileges = (PRIVILEGE_RESOURCE_STUDENTS,)

    definitions = {'StudentSchema': schema}
    parameters = [{
        "id": "id_",
            "description": "UUID4 of the student to get",
        "in": "path",
        "type": "string",
        "required": "true"
                }]

    summary = "hello"
    description = "a student is high"

    def get(self, *args, **kwargs):
        """GET
                Retrieve a student
                ---
                tags: ["student"]
                summary: Retrieve a student
                description: HWT RETR
                responses:
                  200:
                    description: A student
                    schema:
                      $ref: '#/definitions/StudentSchema'
                    examples:
                      rgb: ['red', 'green', 'blue']
                """
        return super().get(*args, **kwargs)




class StudentsCollectionRes(easy.ImplementsEasyResource,
                            easy.ImplementsGetCollection):
    schema = StudentSchema
    model = Student
    privileges = (PRIVILEGE_RESOURCE_STUDENTS,)
