from functools import partial

from flask_principal import Permission
from sqlalchemy.util import namedtuple

ActionNeed = namedtuple('action_need', ['action'])

ReadNeed = partial(ActionNeed, 'read')
EditNeed = partial(ActionNeed, 'edit')
CreateNeed = partial(ActionNeed, 'create')
DeleteNeed = partial(ActionNeed, 'delete')
EmailNeed = partial(ActionNeed, 'send')
InviteNeed = partial(ActionNeed, 'users')


class GetPermission(Permission):
    def __init__(self):
        need = ReadNeed()
        super(GetPermission, self).__init__(need)


class PatchPermission(Permission):
    def __init__(self):
        need = EditNeed()
        super(PatchPermission, self).__init__(need)


class PostPermission(Permission):
    def __init__(self):
        need = CreateNeed()
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

