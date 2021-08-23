from server.models import (
    Student,
    Guardian,
    Course,
    Payment,
    User,
    Room,
    Schedule,
    Teacher,
    Label,
    Attendance,
    Role,
)
from server.schemas.schemas import (
    StudentSchema,
    GuardianSchema,
    CourseSchema,
    PaymentSchema,
    UserSchema,
    RoomSchema,
    ScheduleSchema,
    TeacherSchema,
    LabelSchema,
    AttendanceSchema,
    RoleSchema,
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
    if model == Label:
        return LabelSchema
    if model == Attendance:
        return AttendanceSchema
    if model == Role:
        return RoleSchema
    raise NotImplementedError(model)
