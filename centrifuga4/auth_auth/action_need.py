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
        need = GetNeed()
        super(GetPermission, self).__init__(need)


class PatchPermission(Permission):
    def __init__(self):
        need = PatchNeed()
        super(PatchPermission, self).__init__(need)


class PostPermission(Permission):
    def __init__(self):
        need = PostNeed()
        super(PostPermission, self).__init__(need)


class DeletePermission(Permission):
    def __init__(self):
        need = DeleteNeed()
        super(DeletePermission, self).__init__(need)


class EmailPermission(Permission):
    def __init__(self):
        need = EmailNeed()
        super(EmailPermission, self).__init__(need)


class InvitePermission(Permission):
    def __init__(self):
        need = InviteNeed()
        super(InvitePermission, self).__init__(need)  # todo simplify super

