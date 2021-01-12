from typing import Callable

from flask_principal import Permission

from centrifuga4.auth_auth.requires import Requires
from centrifuga4.blueprints.api.easy_api import EasyResource


class EasyRequires(Requires):
    """ Requires, but includes the permissions of the easy resource permission field

    port of the Requires permission decorator factory which uses also the
    default permissions inherited from the class it is being used in, and not
    only the ones used when calling
    """

    """
    signature mismatch with super is on porpoise, since the wrapper will be called
    with the current factory self, the function it is being called on, the self of the EasyResource
    and then any other additional arguments.
    """
    # noinspection PyMethodOverriding
    def wrapper(self, function: Callable, resource: EasyResource, *args, **kwargs):
        return super().wrapper(function, resource, *args, **kwargs, _additional_permisions=resource.permissions)

