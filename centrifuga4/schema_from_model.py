from centrifuga4.models import (
    Student,
    Guardian,
    Course,
    Payment,
    User,
    Room,
    Schedule,
    Teacher,
    Need,
    Label,
)
from centrifuga4.schemas.schemas import (
    StudentSchema,
    GuardianSchema,
    CourseSchema,
    PaymentSchema,
    UserSchema,
    RoomSchema,
    ScheduleSchema,
    TeacherSchema,
    NeedSchema,
    LabelSchema,
)


def get_schema_from_model(model):
    if model == Student:
        return StudentSchema
    if model == Course:
        return CourseSchema
    if model == Guardian:
        return GuardianSchema
    if model == Payment:
        return PaymentSchema
    if model == User:
        return UserSchema
    if model == Teacher:
        return TeacherSchema
    if model == Schedule:
        return ScheduleSchema
    if model == Room:
        return RoomSchema
    if model == Need:
        return NeedSchema
    if model == Label:
        return LabelSchema
    raise NotImplementedError(model)
