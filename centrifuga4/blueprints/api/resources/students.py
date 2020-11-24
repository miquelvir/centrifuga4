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

    def get(self, *args, **kwargs):
        """Example endpoint returning a list of colors by palette
        This is using docstrings for specifications.
        ---
        parameters:
          - name: palette
            in: path
            type: string
            enum: ['all', 'rgb', 'cmyk']
            required: true
            default: all
        definitions:
          Palette:
            type: object
            properties:
              palette_name:
                type: array
                items:
                  $ref: '#/definitions/Color'
          Color:
            type: string
        responses:
          200:
            description: A list of colors (may be filtered by palette)
            schema:
              $ref: '#/definitions/Palette'
            examples:
              rgb: ['red', 'green', 'blue']
        """
        return super().get(*args, **kwargs)




class StudentsCollectionRes(easy.ImplementsEasyResource,
                            easy.ImplementsGetCollection):
    schema = StudentSchema
    model = Student
    privileges = (PRIVILEGE_RESOURCE_STUDENTS,)
