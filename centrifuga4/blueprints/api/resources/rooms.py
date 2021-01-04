import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import RoomsPermission
from centrifuga4.models import Room
from centrifuga4.schemas.schemas import RoomSchema


class RoomsRes(easy.EasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsDeleteOne):
    schema = RoomSchema
    model = Room
    permissions = {RoomsPermission}


class RoomsCollectionRes(easy.EasyResource,
                         easy.ImplementsPostOne,
                         easy.ImplementsGetCollection):
    schema = RoomSchema
    model = Room
    permissions = {RoomsPermission}
