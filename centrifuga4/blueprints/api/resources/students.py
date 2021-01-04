import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import StudentsPermission
from centrifuga4.models import Student
from centrifuga4.schemas.schemas import StudentSchema


class StudentsRes(easy.EasyResource,
                  easy.ImplementsGetOne,
                  easy.ImplementsPatchOne,
                  easy.ImplementsDeleteOne):
    schema = StudentSchema
    model = Student
    permissions = {StudentsPermission}

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


class StudentsCollectionRes(easy.EasyResource,
                            easy.ImplementsPostOne,
                            easy.ImplementsGetCollection):
    schema = StudentSchema
    model = Student
    permissions = {StudentsPermission}


