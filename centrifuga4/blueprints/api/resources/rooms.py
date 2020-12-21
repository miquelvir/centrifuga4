import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_ROOMS
from centrifuga4.models import Room
from centrifuga4.schemas.schemas import RoomSchema


class RoomsRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = RoomSchema
    model = Room
    privileges = (PRIVILEGE_RESOURCE_ROOMS,)


class RoomsCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = RoomSchema
    model = Room
    privileges = (PRIVILEGE_RESOURCE_ROOMS,)
