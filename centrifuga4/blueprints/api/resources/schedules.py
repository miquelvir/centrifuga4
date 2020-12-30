import centrifuga4.blueprints.api.common.easy_api as easy
from centrifuga4.auth_auth.resource_need import SchedulesPermission
from centrifuga4.models import Schedule
from centrifuga4.schemas.schemas import ScheduleSchema


class SchedulesRes(easy.EasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = ScheduleSchema
    model = Schedule
    permissions = {SchedulesPermission}


class SchedulesCollectionRes(easy.EasyResource,
                         easy.ImplementsGetCollection):
    schema = ScheduleSchema
    model = Schedule
    permissions = {SchedulesPermission}
