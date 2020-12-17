from marshmallow import post_load, validates_schema, ValidationError, RAISE
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, fields
import centrifuga4.models as models
from centrifuga4 import db
from flasgger import Schema


class BaseAutoSchema(SQLAlchemyAutoSchema):
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
        return self.Meta.model(**data)


class RoomSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Room


class CourseSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Course


class ScheduleSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Schedule


class PersonSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Person


class GuardianSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Guardian


class StudentSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Student

    # guardians = fields.Nested(GuardianSchema, many=True)  # todo do rest


class PeriodicDateSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.PeriodicDate


class PaymentSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Payment


class UserSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.User


class TeacherSchema(BaseAutoSchema, Schema):
    class Meta(BaseAutoSchema.Meta):
        model = models.Teacher

    # courses = fields.Nested(CourseSchema, many=True) for nesting

