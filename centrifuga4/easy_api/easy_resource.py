from flasgger import SwaggerView
from flask_principal import Permission
from flask_restful import Resource
from flask_sqlalchemy import Model
from marshmallow_sqlalchemy import SQLAlchemySchema


class EasyResource(Resource, SwaggerView):
    """
    a resource which can be extended when inheriting from it implementing the different methods
    """

    def __init_subclass__(cls, **kwargs):
        """checks that subclasses inherit correctly

        that is:
            - subclasses must define a schema field
            - the schema field must be a SQLAlchemySchema
            - subclasses must define a model field
            - the model field must be a SQLAlchemy model
            - subclasses must define a permissions field
            - the permissions field must be a FlaskPrincipal permissions
        """
        try:
            cls.schema
        except AttributeError:
            assert False, "instances of EasyResource must define field schema"

        assert issubclass(cls.schema, SQLAlchemySchema), (
            "instances of EasyResource must initialise field schema with a valid Marshmallow schema, found %s"
            % type(cls.schema).__name__
        )

        try:
            cls.model
        except AttributeError:
            assert False, "instances of EasyResource must define field model"

        assert issubclass(cls.model, Model), (
            "instances of EasyResource must initialise field model with a valid SQLAlchemy model, found %s"
            % type(cls.model).__name__
        )

        try:
            cls.permissions
        except AttributeError:
            assert False, "instances of EasyResource must define field permissions"

        try:
            for permission in cls.permissions:
                assert type(permission) == type(Permission), (
                    "instances of EasyResource must initialise field permissions "
                    "with an iterable of Flask Principal permissions, "
                    "found an iterable of '%s'" % type(permission)
                )

        except TypeError:
            assert False, (
                "instances of EasyResource must initialise field permissions with an iterable of Flask "
                "Principal permissions, found no iterable but '%s'"
                % type(cls.permissions)
            )

    def __init__(self, *args, **kwargs):
        """ initialises the schema field and adds an empty permissions field if not given """
        super().__init__(*args, **kwargs)

        self.schema = self.schema()  # init schema
