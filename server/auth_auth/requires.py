from typing import Union, List, Tuple, Iterable, Callable

from flask import g, current_app
from flask_login import login_required
from flask_principal import Permission

from server.errors.authorization import Forbidden


def check_permissions(required_permissions: Iterable[type(Permission)]) -> bool:
    """
    checks if the user provides enough needs to pass all the required permissions

    :param required_permissions: an iterable with all the permissions to be checked
    :return: true if the current user passes all permissions, false otherwise
    """
    if current_app.config["DEVELOPMENT"]:
        # session cookie does not work properly if using the front end server independently
        return True

    # check if used provides enough needs to pass all permissions
    if not all((p().can() for p in required_permissions)):
        return False

    return True


class Requires:
    """
    decorator factory

    creates decorators which only call the function if all needed permissions are meet,
    otherwise it raises a Forbidden exception
    """

    def __init__(self, *method_permissions: type(Permission)):
        """ store all permissions passed as *args in a tuple """
        self.method_permissions: set = set(method_permissions)

    @login_required
    def wrapper(self, function: Callable, *args, _additional_permisions=None, **kwargs):
        """ function wrapper, raises Forbidden exception if permissions are not met """
        if _additional_permisions is None:
            _additional_permisions = {}
        if not check_permissions(self.method_permissions.union(_additional_permisions)):
            raise Forbidden(
                "Insufficient privileges for requested action.",
                receivedPrivileges=[str(p) for p in g.identity.provides],
                expectedPrivileges=[
                    p.__name__
                    for p in self.method_permissions.union(_additional_permisions)
                ],
            )
        return function(*args, **kwargs)

    def __call__(self, function: Callable):
        """returns a decorator for the given function

        the decorator is called using the wrapper with all the given args and kwargs
        """
        return lambda *args, **kwargs: self.wrapper(function, *args, **kwargs)
