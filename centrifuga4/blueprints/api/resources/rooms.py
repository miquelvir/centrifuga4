import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.auth_auth.resource_need import RoomsPermission
from centrifuga4.models import Room
from centrifuga4.schemas.schemas import RoomSchema


class RoomsRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = RoomSchema
    model = Room
    permissions = (RoomsPermission,)


class RoomsCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = RoomSchema
    model = Room
    permissions = (RoomsPermission,)
