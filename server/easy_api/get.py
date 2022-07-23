from flask import request, current_app, jsonify
from flask_login import login_required
from sqlalchemy.exc import InvalidRequestError
import json

from server.auth_auth.require import Require
from server.easy_api._content_negotiation import produces
from server.blueprints.api.errors import (
    NotFound,
    ResourceModelBadRequest,
    BaseBadRequest,
)
from server.models._base import MyBase
from server.schemas.schemas import MySQLAlchemyAutoSchema


class KeyContainer:
    def __init__(self, obj, fields):
        self.object = obj
        self.fields = fields


def _get_page_url(original_url, page, _page):
    url_params = request.url[len(request.base_url) :]
    if len(url_params) <= 1:
        return "%s?page=%s" % (original_url, _page)
    else:
        if "?page=%s" % page in url_params:
            url_params = url_params.replace("?page=%s" % page, "?page=%s" % _page)
        elif "&page=%s" % page in url_params:
            url_params = url_params.replace("&page=%s" % page, "&page=%s" % _page)
        else:
            url_params += "&page=%s" % _page
        return request.base_url + url_params


def get_pagination_header(pagination, page):
    return {
        "_pagination": {
            "currentPage": pagination.page,
            "totalItems": pagination.total,
            "perPage": pagination.per_page,
            "nextPage": pagination.next_num,
            "prevPage": pagination.prev_num,
            "hasNext": pagination.has_next,
            "hasPrev": pagination.has_prev,
            "totalPages": pagination.pages,
        },
        "_links": {
            "self": {"href": _get_page_url(request.base_url, page, page)},
            "first": {"href": _get_page_url(request.base_url, page, 1)},
            "last": {
                "href": _get_page_url(
                    request.url, page, pagination.pages if pagination.pages != 0 else 1
                )
            },
            "prev": {"href": _get_page_url(request.url, page, pagination.prev_num)}
            if page > 1
            else None,
            "next": {"href": _get_page_url(request.url, page, pagination.next_num)}
            if page < pagination.pages
            else None,
        },
    }


class _ImplementsGet:
    """abstract class both for the Collection and the One get resources"""

    model: type(MyBase)
    schema: MySQLAlchemyAutoSchema

    def _parse_args(self, url_args):
        filters = []
        sort = None
        include = None
        page = 1
        for k, v in url_args.items():
            k = k.split(".", 2)
            if k[0] == "filter":
                try:
                    field = k[1]
                    operator = k[2]
                except IndexError:
                    raise BaseBadRequest(
                        "Filter must have operator 'eq' or 'like'. Syntax: filter.[param-name].[operator]"
                    )

                if (
                    v == "true"
                ):  # todo proper; it is json loadable, but are other values
                    v = True
                elif v == "false":
                    v = False
                elif v == "null":
                    v = None
                if operator == "eq":
                    try:
                        filters.append(self.model.get_field(field) == v)
                    except AttributeError as e:
                        raise BaseBadRequest("can't access field '%s'" % v)
                elif operator == "like":
                    try:
                        filters.append(self.model.get_field(field).like(v))
                    except AttributeError as e:
                        raise BaseBadRequest("can't access field '%s'" % v)
                elif operator == "match":
                    try:
                        if current_app.config["DEVELOPMENT"]:
                            filters.append(
                                self.model.get_field(field).like("%" + v + "%")
                            )
                        else:
                            filters.append(self.model.get_field(field).match(v))
                    except AttributeError as e:
                        raise BaseBadRequest("can't access field '%s'" % v)
                else:
                    raise BaseBadRequest(
                        "Filter must have operator 'eq' or 'like'. Found: '%s'" % k[2]
                    )

            elif k[0] == "sort":
                try:
                    sort = self.model.get_field(v)
                except AttributeError:
                    raise BaseBadRequest("Uknown field '%s'" % v)
            elif k[0] == "page":
                try:
                    page = int(v)
                except ValueError:
                    if v == "*":
                        page = None
                    else:
                        raise BaseBadRequest("Page is not a valid integer")
            elif k[0] == "include":
                if include is None:
                    try:
                        include = [self.model.get_field(f) for f in json.loads(v)]
                    except AttributeError:
                        raise BaseBadRequest("specified fields not found")
                else:
                    raise BaseBadRequest(
                        "include can only appear once, an does not take a dot parameter"
                    )
            else:
                raise BaseBadRequest(
                    "Invalid query element found.", **{k[0]: "Query item not accepted."}
                )
        return filters if len(filters) > 0 else None, sort, page, include

    @produces(
        ("application/json", "text/csv")
    )  # content negotiation (and automatic creation of raw csv from json)
    @login_required
    def get(self, *args, id_=None, parent=None, many=False, **kwargs):
        filters, sort, page, include = self._parse_args(request.args)
        do_pagination = page is not None

        query = self.model.query

        if parent:
            query = query.with_parent(parent)

        """if include:  # todo
            query = query.with_entities(*include)"""

        if filters:
            query = query.filter(*filters)

        if many:

            if sort:
                query = query.order_by(sort)

            try:
                if do_pagination:
                    pagination = query.paginate(
                        page,
                        per_page=current_app.config["API_PAGINATION"],
                        error_out=True,
                    )
                    result = pagination.items
                else:
                    result = query.all()
            except InvalidRequestError as e:
                raise ResourceModelBadRequest(e)

            for obj in result:
                Require.ensure.read(obj)
        else:

            if not id_:
                raise BaseBadRequest("id_ must be given")

            query = query.filter_by(id=id_)

            try:
                result = query.first()
            except InvalidRequestError as e:
                raise ResourceModelBadRequest(e)

            if not result:
                raise NotFound(
                    "resource with the given id not found (after applying filters)",
                    requestedId=id_,
                    filters=request.args,
                )

            Require.ensure.read(result)

        dumped_result = self.schema.dump(result, many=many)

        if not (many and do_pagination):
            return result, {"data": dumped_result}

        return (
            result,
            {"data": dumped_result, **get_pagination_header(pagination, page)},
        )


class ImplementsGetOne(_ImplementsGet):
    """get one item of a resource with its id"""

    model: MyBase
    schema: MySQLAlchemyAutoSchema

    def get(self, id_, *args, **kwargs):
        results = []
        for one_id in id_.split(","):
            result = super().get(*args, id_=one_id, many=False, **kwargs)
            results.append(result)

        if len(results) == 1:  # todo clean
            return results[0]
        else:
            return jsonify([r.json for r in results])


class ImplementsGetCollection(_ImplementsGet):
    """get all items of a resource"""

    model: MyBase
    schema: MySQLAlchemyAutoSchema

    def get(self, *args, **kwargs):
        return super().get(*args, many=True, **kwargs)
