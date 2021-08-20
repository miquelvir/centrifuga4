from typing import Sequence, Callable, Iterable

from flask import g, current_app
from flask_login import login_required, current_user
from flask_principal import Permission

from server.auth_auth.new_needs import MyPermission
from server.errors.authorization import Forbidden


def check_permissions(required_permissions: Iterable[type(Permission)]) -> bool:
    """
    checks if the user provides enough needs to pass all the required permissions

    :param required_permissions: an iterable with all the permissions to be checked
    :return: true if the current user passes all permissions, false otherwise
    """
    if current_app.config["DEVELOPMENT"]:
        # session cookie does not work properly if using the front end server independently
        return True  # todo migrate to jwt or something?

    if all(
        p.can() if type(p) is MyPermission else p.permission.can()
        for p in required_permissions
    ):
        return True  # optimize for non-teachers

    # lazy load remaining permissions
    if hasattr(current_user, "role"):
        current_user.role.load_needs_to_identity_for_permissions(
            current_user, required_permissions
        )

    # check if used provides enough needs to pass all permissions
    if any(
        not p.can() if type(p) is MyPermission else not p.permission.can()
        for p in required_permissions
    ):
        return False

    return True


def assert_permissions(permissions: Iterable[type(Permission)]):
    if not check_permissions(permissions):
        raise Forbidden(
            "Insufficient privileges for requested action.",
            receivedPrivileges=[str(p) for p in g.identity.provides],
            expectedPrivileges=[str(p) for p in permissions],
        )


class Requires:
    """
    decorator factory

    creates decorators which only call the function if all needed permissions are meet,
    otherwise it raises a Forbidden exception
    """

    def __init__(self, *method_permissions: type(Permission)):
        """store all permissions passed as *args in a tuple"""
        self.method_permissions: set = set(method_permissions)

    def require(self, permissions: iter = None):
        if permissions is None:
            permissions = {}
        assert_permissions(self.method_permissions.union(permissions))

    @login_required
    def wrapper(self, function: Callable, *args, _additional_permisions=None, **kwargs):
        """function wrapper, raises Forbidden exception if permissions are not met"""
        self.require(_additional_permisions)
        return function(*args, **kwargs)

    def __call__(self, function: Callable):
        """returns a decorator for the given function

        the decorator is called using the wrapper with all the given args and kwargs
        """
        return lambda *args, **kwargs: self.wrapper(function, *args, **kwargs)
