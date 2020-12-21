import centrifuga4.blueprints.api.common.base_resource as easy
from centrifuga4.jwt_utils.privileges import PRIVILEGE_RESOURCE_SCHEDULES
from centrifuga4.models import Schedule
from centrifuga4.schemas.schemas import ScheduleSchema


class SchedulesRes(easy.ImplementsEasyResource,
               easy.ImplementsGetOne,
               easy.ImplementsPatchOne,
               easy.ImplementsPostOne,
               easy.ImplementsDeleteOne):
    schema = ScheduleSchema
    model = Schedule
    privileges = (PRIVILEGE_RESOURCE_SCHEDULES,)


class SchedulesCollectionRes(easy.ImplementsEasyResource,
                         easy.ImplementsGetCollection):
    schema = ScheduleSchema
    model = Schedule
    privileges = (PRIVILEGE_RESOURCE_SCHEDULES,)
