from functools import partial

from flask_principal import Permission
from sqlalchemy.util import namedtuple

ActionNeed = namedtuple('action_need', ['action'])

ReadNeed = partial(ActionNeed, 'read')
EditNeed = partial(ActionNeed, 'edit')
CreateNeed = partial(ActionNeed, 'create')
DeleteNeed = partial(ActionNeed, 'delete')
SendNeed = partial(ActionNeed, 'send')
UsersNeed = partial(ActionNeed, 'users')


class ReadPermission(Permission):
    def __init__(self):
        need = ReadNeed()
        super(ReadPermission, self).__init__(need)


class EditPermission(Permission):
    def __init__(self):
        need = EditNeed()
        super(EditPermission, self).__init__(need)


class CreatePermission(Permission):
    def __init__(self):
        need = CreateNeed()
        super(CreatePermission, self).__init__(need)


class DeletePermission(Permission):
    def __init__(self):
        need = DeleteNeed()
        super(DeletePermission, self).__init__(need)


class SendPermission(Permission):
    def __init__(self):
        need = SendNeed()
        super(SendPermission, self).__init__(need)

