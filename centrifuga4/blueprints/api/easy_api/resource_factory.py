from typing import List, Tuple

from flask_restful import Resource
from sqlalchemy import inspect
from sqlalchemy.orm import Mapper, RelationshipProperty

from centrifuga4.blueprints.api import easy_api as easy
from centrifuga4.models import Student, Guardian, Course, Payment, User, Room, Schedule, Teacher, Need, Label
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import StudentSchema, GuardianSchema, CourseSchema, PaymentSchema, UserSchema, \
    RoomSchema, ScheduleSchema, TeacherSchema, NeedSchema, LabelSchema


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


def get_resources(model, individual=True, collection=True, nested=True) -> List[Tuple[Resource, str]]:
    resources = []

    resource_name = model.__tablename__ + 's'

    if collection:
        resource = type("Easy%sCollectionResource" % model.__tablename__.title(),
                        (easy.EasyResource,
                         easy.ImplementsPostOne,
                         easy.ImplementsGetCollection),
                        {
                            "schema": get_schema_from_model(model),
                            "model": model,
                            "permissions": model.permissions
                        })

        resources.append((resource, "/%s" % resource_name))

    if individual:
        resource = type("Easy%sResource" % model.__tablename__.title(),
                        (easy.EasyResource,
                         easy.ImplementsGetOne,
                         easy.ImplementsPatchOne,
                         easy.ImplementsDeleteOne),
                        {
                            "schema": get_schema_from_model(model),
                            "model": model,
                            "permissions": model.permissions
                        })
        resources.append((resource, "/%s/<string:id_>" % resource_name))

    if nested:
        for relation in inspect(model).relationships:
            relation: RelationshipProperty = relation
            mapper: Mapper = relation.mapper
            nested_model: type(MyBase) = mapper.entity

            nested_resource_name = nested_model.__tablename__ + 's'

            resource = type("Easy%s%sResource" % (model.__tablename__.title(), nested_model.__tablename__.title()),
                            (easy.EasyResource,
                             easy.ImplementsPostOneSubresource,
                             easy.ImplementsDeleteOneSubresource),
                            {
                                "schema": get_schema_from_model(nested_model),
                                "model": nested_model,
                                "parent_model": model,
                                "parent_field": nested_resource_name,
                                "permissions": model.permissions.union(nested_model.permissions)
                            })
            resources.append(
                (resource, "/%s/<string:id_>/%s/<string:nested_id>" % (resource_name, nested_resource_name)))

    return resources
