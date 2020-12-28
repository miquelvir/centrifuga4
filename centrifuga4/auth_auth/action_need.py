from functools import partial

from flask_principal import Permission
from sqlalchemy.util import namedtuple

ActionNeed = namedtuple('action_need', ['action'])

GetNeed = partial(ActionNeed, 'get')
PatchNeed = partial(ActionNeed, 'patch')
PostNeed = partial(ActionNeed, 'post')
DeleteNeed = partial(ActionNeed, 'delete')
EmailNeed = partial(ActionNeed, 'email')
InviteNeed = partial(ActionNeed, 'invite')


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

