from flask import request, current_app
from sqlalchemy.exc import InvalidRequestError

from centrifuga4.auth_auth.action_need import GetPermission
from centrifuga4.blueprints.api.common.easy_api._content_negotiation import produces
from centrifuga4.blueprints.api.common.easy_api._requires import EasyRequires
from centrifuga4.blueprints.api.common.errors import NotFound, ResourceModelBadRequest, BaseBadRequest
from centrifuga4.models._base import MyBase
from centrifuga4.schemas.schemas import MySQLAlchemyAutoSchema


def safe_get(function):
    """ a safe get is one which checks for the user permissions to get such resource """
    @EasyRequires(GetPermission)
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)
    return decorator


class _ImplementsGet:
    """ abstract class both for the Collection and the One get resources """
    model: MyBase
    schema: MySQLAlchemyAutoSchema

    def _parse_args(self, url_args):
        filters = []
        sort = None
        page = 1
        for k, v in url_args.items():
            k = k.split('.', 2)
            if k[0] == "filter":
                try:
                    field = k[1]
                    operator = k[2]
                except IndexError:
                    raise BaseBadRequest("Filter must have operator 'eq' or 'like'. Syntax: filter.[param-name].[operator]")

                try:
                    if operator == "eq":
                        filters.append(self.model.get_field(field) == v)
                    elif operator == "like":
                        filters.append(self.model.get_field(field).like(v))
                    else:
                        raise BaseBadRequest("Filter must have operator 'eq' or 'like'. Found: '%s'" % k[2])
                except KeyError:
                    raise BaseBadRequest("Uknown field '%s'" % field)

            elif k == "sort":
                sort = self.model.get_field(v)  # todo
            elif k[0] == "page":
                try:
                    page = int(v)
                except ValueError:
                    raise BaseBadRequest("Page is not a valid integer")
            else:
                raise BaseBadRequest("Invalid query element found.", **{k[0]: "Query item not accepted."})
        return filters, sort, page

    @safe_get
    @produces(("application/json", "text/csv"))  # content negotiation (and automatic creation of raw csv from json)
    def get(self, *args, id_=None, many=False, **kwargs):
        filters, sort, page = self._parse_args(request.args)  # todo sort
        do_pagination = True

        if many:
            try:
                if do_pagination:
                    if sort:
                        pagination = self.model.query.filter(*filters).sort_by(sort).paginate(page,
                                                                                per_page=current_app.config[
                                                                                    "API_PAGINATION"],
                                                                                error_out=True)
                    else:
                        pagination = self.model.query.filter(*filters).paginate(page,
                                                                            per_page=current_app.config["API_PAGINATION"],
                                                                            error_out=True)
                    result = pagination.items
                else:  # todo sort
                    result = self.model.query.filter(*filters).all()
            except InvalidRequestError as e:
                raise ResourceModelBadRequest(e)

        else:
            if not id_:
                raise BaseBadRequest("id_ must be given")

            try:
                result = self.model.query.filter(self.model.id == id_, *filters).first()
            except InvalidRequestError as e:
                raise ResourceModelBadRequest(e)

            if not result:
                raise NotFound("resource with the given id not found (after applying filters)",
                               requestedId=id_,
                               filters=request.args)

        result = self.schema.dump(result, many=many)

        if many and do_pagination:
            def get_page_url(original_url, _page):
                url_params = request.url[len(request.base_url):]
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

            return {
                "data": result,
                "_pagination": {
                    "currentPage": pagination.page,
                    "totalItems": pagination.total,
                    "perPage": pagination.per_page,
                    "nextPage": pagination.next_num,
                    "prevPage": pagination.prev_num,
                    "hasNext": pagination.has_next,
                    "hasPrev": pagination.has_prev,
                    "totalPages": pagination.pages
                },
                "_links": {
                    "self": {"href": get_page_url(request.base_url, page)},
                    "first": {"href": get_page_url(request.base_url, 1)},
                    "last": {"href": get_page_url(request.url, pagination.pages)},
                    "prev": {"href": get_page_url(request.url, pagination.prev_num)}
                            if page > 1 else None,
                    "next": {"href": get_page_url(request.url, pagination.next_num)}
                            if page < pagination.pages else None
                }
            }
        else:
            return {"data": result}


class ImplementsGetOne(_ImplementsGet):
    """ get one item of a resource with its id """
    model: MyBase
    schema: MySQLAlchemyAutoSchema

    def get(self, id_, *args, **kwargs):
        return super().get(*args, id_=id_, many=False, **kwargs)


class ImplementsGetCollection(_ImplementsGet):
    """ get all items of a resource """
    model: MyBase
    schema: MySQLAlchemyAutoSchema

    def get(self, *args, **kwargs):
        return super().get(*args, many=True, **kwargs)
