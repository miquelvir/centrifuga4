from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models._base import MyBase


def get_parent(parent_model: type(MyBase), id_):
    parent: MyBase = parent_model.query.filter(parent_model.id == id_).one_or_none()

    if not parent:
        raise NotFound("resource with the given id not found", requestedId=id_)

    return parent


def get_subresource(parent_model: type(MyBase), parent_field, id_):
    parent = get_parent(parent_model, id_)

    try:  # todo get field as another function
        field = getattr(
            parent_model, parent_field
        )  # todo in general or the actual instance
    except AttributeError:
        raise NotFound("subresource %s not found" % parent_field)

    return parent, field
