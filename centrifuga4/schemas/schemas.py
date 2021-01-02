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


class RoomSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Room


class CourseSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Course


class ScheduleSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Schedule


class PersonSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Person

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)


class GuardianSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Guardian

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)


class StudentSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Student

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)


class PeriodicDateSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.PeriodicDate


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


class TeacherSchema(MySQLAlchemyAutoSchema):
    class Meta(MySQLAlchemyAutoSchema.Meta):
        model = models.Teacher

        dump_only = (
            model.full_name.key,
        )

    full_name = fields.Str(dump_only=True)
    # courses = fields.Nested(CourseSchema, many=True) for nesting

