from marshmallow import post_load, validates_schema, ValidationError, RAISE, pre_load
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields, auto_field
from marshmallow import fields
import server.models as models
from server import db


def _clean(data, key):
    if key not in data:
        return
    x = data[key]
    if type(x) is not str:
        return
    data[key] = x.lower().strip()


class MySQLAlchemyAutoSchema(SQLAlchemyAutoSchema):  # todo flasgger.Schema
    """
    Base class for automatic Marshmallow schemas

    Base class of Marshmallow-SQLAlchemy to automatically generate
    Marshmallow Schemas for each SQLAlchemy model; additionally,
    it uses the default db session and load returns an object instead
    of a dictionary.
    """

    class Meta:
        """
        Meta class

        sqla_session the session to be used, includes relationships,
        model is to be implemented in children
        """

        sqla_session = db.Session
        include_relationships = True
        include_fk = True
        unknown = RAISE
        model: type

    @post_load
    def make(self, data, **_):
        """
        makes an object of the type model with the initialization data
        :param data: kwargs of the serialization dict
        :param _: ignored additional kwargs
        :return: object of type stored in model
        """
        return self.Meta.model(**data)  # init


class BaseScheduleSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Schedule


class CourseSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Course

    base_schedules = fields.Nested(BaseScheduleSchema, many=True)
    calendar_url = fields.Str(dump_only=True)
    attendances = fields.Str(dump_only=True, load_only=True)


class PublicCourseSchema(CourseSchema):
    schedules = fields.Nested(BaseScheduleSchema, many=True)


class RoleSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Role


class LabelSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Label


class ScheduleSchema(BaseScheduleSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Schedule

    course = fields.Nested(CourseSchema(only=("id", "name")), many=False)
    is_base = fields.Bool(dump_only=True)
    display_name = fields.Str(dump_only=True)


class RoomSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Room

    schedules = fields.Pluck(ScheduleSchema, "id", many=True)


class PersonSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Person

    full_name = fields.Str(dump_only=True)
    is_underage = fields.Bool(dump_only=True)
    age = fields.Int(dump_only=True)

    @pre_load
    def clean_fields(self, in_data, **kwargs):
        _clean(in_data, "name")
        _clean(in_data, "surname1")
        _clean(in_data, "surname2")
        _clean(in_data, "address")
        _clean(in_data, "zip")
        _clean(in_data, "city")
        _clean(in_data, "dni")

        return in_data


class GuardianSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Guardian

        dump_only = (model.full_name.key,)

    full_name = fields.Str(dump_only=True)
    age = fields.Int(dump_only=True)


class StudentSchema(PersonSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Student

    schedules = fields.Pluck(ScheduleSchema, "id", many=True)
    attendances = fields.Str(dump_only=True, load_only=True)
    display_name = fields.Str(dump_only=True)
    official_notification_emails = fields.List(fields.Str, dump_only=True)


class PaymentSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Payment


class UserSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.User

        dump_only = (model.full_name.key,)

    full_name = fields.Str(dump_only=True)
    password_hash = fields.Str(
        load_only=True, dump_only=True
    )  # due to security: don't allow loading nor dumping


class TeacherSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Teacher

    schedules = fields.Pluck(ScheduleSchema, "id", many=True)
    full_name = fields.Str(dump_only=True)
    age = fields.Int(dump_only=True)
    calendar_url = fields.Str(dump_only=True)


class AttendanceSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Attendance
