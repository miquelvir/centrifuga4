from functools import wraps
from typing import Union, List, Tuple

from flask import g
from flask_principal import Permission

from centrifuga4.errors.authorization import Forbidden


def check_permissions(permissions: Union[List[Permission], Tuple[Permission, ...]]):
    print(g.identity.provides, [p.__name__ for p in permissions])
    return True  # todo production, perfect permissions in db
    if not all((p().can() for p in permissions)):
        raise Forbidden("Insufficient privileges for requested action.",
                        receivedPrivileges=[str(p) for p in g.identity.provides],
                        expectedPrivileges=[p.__name__ for p in permissions])
    return True


def requires(*needs):
    def decorator(function):
        @wraps(function)
        def function_wrapper(*args, **kwargs):
            """ allow only if current JWT in cookie has admin role """
            if check_permissions(needs):
                return function(*args, **kwargs)

        return function_wrapper

    return decorator
