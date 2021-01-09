from functools import partial

from flask_principal import Permission
from sqlalchemy.util import namedtuple

"""
A Need is the smallest level of granularity in Flask Principal.

ActionNeed is, in the context of this project, a need which defines an action which a user
can or can not perform.
"""


ActionNeed = namedtuple('action_need', ['action'])

GetNeed = partial(ActionNeed, 'get')  # correlates to the HTTP GET verb
PatchNeed = partial(ActionNeed, 'patch')  # correlates to the HTTP PATCH verb
PostNeed = partial(ActionNeed, 'post')  # correlates to the HTTP POST verb
DeleteNeed = partial(ActionNeed, 'delete')  # correlates to the HTTP DELETE verb
EmailNeed = partial(ActionNeed, 'send_email')
InviteNeed = partial(ActionNeed, 'invite_users')


"""
A permission encapsulates a need, and can be used to check whether
the current Flask Principal identity has access to it.

Each need has an individual permission, which is used by default in the corresponding
methods of the API. 
"""


class GetPermission(Permission):
    def __init__(self):
        super().__init__(GetNeed())


class PatchPermission(Permission):
    def __init__(self):
        super().__init__(PatchNeed())


class PostPermission(Permission):
    def __init__(self):
        super().__init__(PostNeed())


class DeletePermission(Permission):
    def __init__(self):
        super().__init__(DeleteNeed())


class EmailPermission(Permission):
    def __init__(self):
        super().__init__(EmailNeed())


class InvitePermission(Permission):
    def __init__(self):
        super().__init__(InviteNeed())

