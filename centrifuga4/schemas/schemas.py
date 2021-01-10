from marshmallow import post_load, validates_schema, ValidationError, RAISE, pre_load
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields, auto_field
from marshmallow import fields
import centrifuga4.models as models
from centrifuga4 import db
from flasgger import Schema


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


class CourseSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Course


class ScheduleSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Schedule

    course = fields.Nested(CourseSchema(only=("id", "name")), many=False)


class RoomSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Room

    schedules = fields.Pluck(ScheduleSchema, "id", many=True)


class RawPersonSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.RawPerson

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)
    age = fields.Int(dump_only=True)


class PersonSchema(RawPersonSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Person


class GuardianSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Guardian

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)


class StudentSchema(PersonSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Student

    schedules = fields.Pluck(ScheduleSchema, "id", many=True)


class PaymentSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Payment


class UserSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.User

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)
    password_hash = fields.Str(load_only=True)  # due to security


class TeacherSchema(RawPersonSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Teacher

    # courses = fields.Nested(CourseSchema, many=True) for nesting
    schedules = fields.Pluck(ScheduleSchema, "id", many=True)

