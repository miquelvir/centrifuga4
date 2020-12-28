from functools import wraps
from typing import Union, List, Tuple

from flask import g, current_app
from flask_principal import Permission

from centrifuga4.errors.authorization import Forbidden


def check_permissions(permissions: Union[List[type(Permission)], Tuple[type(Permission), ...]]):
    if current_app.config["DEVELOPMENT"]:
        # session cookie does not work properly if using the front end server independently
        return True

    if not all((p().can() for p in permissions)):
        return False

    return True


class Requires:
    def __init__(self, *permissions):
        self.permissions = set(permissions)

    def wrapper(self, function, *args, **kwargs):
        if not check_permissions(self.permissions):
            raise Forbidden("Insufficient privileges for requested action.",
                            receivedPrivileges=[str(p) for p in g.identity.provides],
                            expectedPrivileges=[p.__name__ for p in self.permissions])
        return function(*args, **kwargs)

    def __call__(self, function):
        return lambda *args, **kwargs: self.wrapper(function, *args, **kwargs)

