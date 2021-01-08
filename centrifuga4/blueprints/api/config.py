from flask import Blueprint
from flask_jwt_extended.exceptions import NoAuthorizationError
from flask_restful import Api as Api

from centrifuga4.blueprints.api.common.errors import Unauthorized, Forbidden
from centrifuga4.blueprints.api.resources.courses import CoursesRes, CoursesCollectionRes
from centrifuga4.blueprints.api.resources.guardians import GuardiansRes, GuardiansCollectionRes, StudentGuardiansRes
from centrifuga4.blueprints.api.resources.payments import PaymentsRes, PaymentsCollectionRes, StudentPaymentsRes, \
    PaymentsRecipesRes
from centrifuga4.blueprints.api.resources.rooms import RoomsRes, RoomsCollectionRes
from centrifuga4.blueprints.api.resources.schedules import SchedulesRes, SchedulesCollectionRes
from centrifuga4.blueprints.api.resources.students import StudentsRes, StudentsCollectionRes
from centrifuga4.blueprints.api.resources.teachers import TeachersRes, TeachersCollectionRes
from centrifuga4.blueprints.api.resources.users import UsersCollectionRes, UsersRes
from centrifuga4.errors.authorization import Forbidden as RawForbidden

api_blueprint = Blueprint('api', __name__, template_folder="templates")


@api_blueprint.errorhandler(NoAuthorizationError)
def handle(e):
    raise Unauthorized(str(e))


@api_blueprint.errorhandler(RawForbidden)
def handle(e):
    print(e)
    raise Forbidden(e.message, **e.kwargs)


api = Api(api_blueprint)

api.add_resource(StudentsRes, '/students/<string:id_>')
api.add_resource(StudentPaymentsRes, '/students/<string:id_>/payments')
api.add_resource(StudentGuardiansRes, '/students/<string:id_>/guardians')
api.add_resource(StudentsCollectionRes, '/students')

api.add_resource(GuardiansRes, '/guardians/<string:id_>')
api.add_resource(GuardiansCollectionRes, '/guardians')

api.add_resource(UsersRes, '/users/<string:id_>')
api.add_resource(UsersCollectionRes, '/users')

api.add_resource(CoursesRes, '/courses/<string:id_>')
api.add_resource(CoursesCollectionRes, '/courses')

api.add_resource(PaymentsRes, '/payments/<string:id_>')
api.add_resource(PaymentsRecipesRes, '/payments/<string:id_>/recipe')
api.add_resource(PaymentsCollectionRes, '/payments')

api.add_resource(SchedulesRes, '/schedules/<string:id_>')
api.add_resource(SchedulesCollectionRes, '/schedules')

api.add_resource(TeachersRes, '/teachers/<string:id_>')
api.add_resource(TeachersCollectionRes, '/teachers')

api.add_resource(RoomsRes, '/rooms/<string:id_>')
api.add_resource(RoomsCollectionRes, '/rooms')
