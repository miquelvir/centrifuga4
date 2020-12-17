from functools import wraps
from flask_jwt_extended import get_jwt_claims

from centrifuga4.errors.authorization import Forbidden


PRIVILEGE_ACTION_READ = "actionRead"
PRIVILEGE_ACTION_EDIT = "actionEdit"
PRIVILEGE_ACTION_CREATE = "actionCreate"
PRIVILEGE_ACTION_DELETE = "actionDelete"
PRIVILEGE_ACTION_SEND_EMAILS = "actionSend"

PRIVILEGE_RESOURCE_USERS = "resUsers"
PRIVILEGE_RESOURCE_TEACHERS = "resTeachers"
PRIVILEGE_RESOURCE_GUARDIANS = "resGuardians"
PRIVILEGE_RESOURCE_STUDENTS = "resStudents"
PRIVILEGE_RESOURCE_COURSES = "resCourses"
PRIVILEGE_RESOURCE_PAYMENTS = "resPayments"
PRIVILEGE_RESOURCE_ROOMS = "resRooms"
PRIVILEGE_RESOURCE_SCHEDULES = "resSchedules"


def check_privileges(privileges):
    has = get_jwt_claims()["privileges"]
    if not all((p in has for p in privileges)):
        raise Forbidden("Insufficient privileges for requested action.",
                        receivedPrivileges=has,
                        expectedPrivileges=privileges)
    return True


def needs_privileges(*privileges):
    def decorator(function):
        @wraps(function)
        def function_wrapper(*args, **kwargs):
            """ allow only if current JWT in cookie has admin role """
            if check_privileges(privileges):
                return function(*args, **kwargs)

        return function_wrapper

    return decorator



