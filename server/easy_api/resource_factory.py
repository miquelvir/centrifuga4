from typing import List, Tuple

from flask_restful import Resource
from sqlalchemy import inspect
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapper, RelationshipProperty

from server import easy_api as easy
from server.models import Student

from server.models._base import MyBase
from server.schema_from_model import get_schema_from_model


def get_resources(
    model, individual=True, collection=True, nested=True
) -> List[Tuple[Resource, str]]:
    resources = []

    resource_name = model.__tablename__ + "s"

    if collection:
        resource = type(
            "Easy%sCollectionResource" % model.__tablename__.title(),
            (easy.EasyResource, easy.ImplementsPostOne, easy.ImplementsGetCollection),
            {
                "schema": get_schema_from_model(model),
                "model": model,
                "permissions": model.permissions,
            },
        )

        resources.append((resource, "/%s" % resource_name))

    if individual:
        resource = type(
            "Easy%sResource" % model.__tablename__.title(),
            (
                easy.EasyResource,
                easy.ImplementsGetOne,
                easy.ImplementsPatchOne,
                easy.ImplementsDeleteOne,
            ),
            {
                "schema": get_schema_from_model(model),
                "model": model,
                "permissions": model.permissions,
            },
        )
        resources.append((resource, "/%s/<string:id_>" % resource_name))

    if nested:
        m: Mapper = inspect(model)

        for relation in list(inspect(model).relationships):
            relation: RelationshipProperty = relation
            mapper: Mapper = relation.mapper
            nested_model: type(MyBase) = mapper.entity

            nested_resource_name = nested_model.__tablename__ + "s"

            resource = type(
                "Easy%s%sResource"
                % (model.__tablename__.title(), nested_model.__tablename__.title()),
                (
                    easy.EasyResource,
                    easy.ImplementsPostOneSubresource,
                    easy.ImplementsDeleteOneSubresource,
                ),
                {
                    "schema": get_schema_from_model(nested_model),
                    "model": nested_model,
                    "parent_model": model,
                    "parent_field": nested_resource_name,
                    "permissions": model.permissions.union(nested_model.permissions),
                },
            )
            resources.append(
                (
                    resource,
                    "/%s/<string:id_>/%s/<string:nested_id>"
                    % (resource_name, nested_resource_name),
                )
            )

            resource = type(
                "Easy%s%sCollectionResource"
                % (model.__tablename__.title(), nested_model.__tablename__.title()),
                (easy.EasyResource, easy.ImplementsGetCollectionSubresource),
                {
                    "schema": get_schema_from_model(nested_model),
                    "model": nested_model,
                    "parent_model": model,
                    "parent_field": nested_resource_name,
                    "permissions": model.permissions.union(nested_model.permissions),
                },
            )
            resources.append(
                (
                    resource,
                    "/%s/<string:id_>/%s" % (resource_name, nested_resource_name),
                )
            )

    return resources
