from functools import wraps
from typing import List

from flasgger import SwaggerView
from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from flask_sqlalchemy import Model

from sqlalchemy.exc import InvalidRequestError

from centrifuga4 import db
from centrifuga4.blueprints.api.common.content_negotiation import produces
from centrifuga4.blueprints.api.common.errors import integrity, no_nested, safe_marshmallow, NotFound, \
    ResourceBaseBadRequest, ResourceModelBadRequest, BaseBadRequest
from centrifuga4.blueprints.api.common.identifiers import generate_new_id
from centrifuga4.jwt_utils.privileges import PRIVILEGE_ACTION_CREATE, \
    PRIVILEGE_ACTION_DELETE, PRIVILEGE_ACTION_EDIT, check_privileges
from centrifuga4.schemas.schemas import BaseAutoSchema


def easy_needs_privileges(*additional_privileges):  # todo avoid code duplication only check self.privileges
    def decorator(function):
        @wraps(function)
        def function_wrapper(self, *args, **kwargs):
            """ allow only if current JWT in cookie has admin role """
            if check_privileges(additional_privileges + self.privileges):
                return function(self, *args, **kwargs)
        return function_wrapper

    return decorator

class ImplementsEasyResource(Resource, SwaggerView):
    def __init_subclass__(cls, **kwargs):
        try:
            cls.schema
        except AttributeError:
            assert False, "instances of EasyResource must define field schema"

        assert issubclass(cls.schema, BaseAutoSchema), "instances of EasyResource must initialise field schema with a valid Marshmallow schema, found %s" % type(
            cls.schema).__name__

        try:
            cls.model
        except AttributeError:
            assert False, "instances of EasyResource must define field model"
        assert issubclass(cls.model,
                          Model), "instances of EasyResource must initialise field model with a valid SQLAlchemy model, found %s" % type(
            cls.model).__name__


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.schema = self.schema()  # init schema

        try:
            self.privileges
        except AttributeError:
            self.privileges = ()


def register(*decorators):
    def register_wrapper(func):
        for deco in decorators[::-1]:
            func=deco(func)
        func._decorators=decorators
        return func
    return register_wrapper


def safe_get(function):
    # @jwt_required
    # @easy_needs_privileges(PRIVILEGE_READ)
    @register(produces(("application/json", "text/csv")))  # todo if 1 res does not need it we should over
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)
    return decorator


class _ImplementsGet:
    model: Model
    schema: BaseAutoSchema

    @staticmethod
    def _parse_args(url_args):
        filters = {}
        sort = {}
        page = 1
        pagination = True
        for k, v in url_args.items():
            k = k.split('.', 1)
            if k[0] == "filter":
                filters[k[1]] = v
            elif k[0] == "sort":
                sort[k[1]] = v  # todo
            elif k[0] == "page":
                page = int(v)  # todo
            elif k[0] == "pagination":
                pagination = bool(int(v))
            else:
                raise BaseBadRequest("Invalid query element found.", **{k[0]: "Query item not accepted."})
        return filters, sort, pagination, page

    @register(safe_get)
    def get(self, *args, id_=None, many=False, **kwargs):
        filters, _, do_pagination, page = self._parse_args(request.args)

        if many:  # todo destroy super and do both?
            try:
                if do_pagination:
                    pagination = self.model.query.filter_by(**filters).paginate(page, per_page=20, error_out=True)  # .all()
                    result = pagination.items  # todo per page constant line above
                else:
                    result = self.model.query.filter_by(**filters).all()
            except InvalidRequestError as e:
                raise ResourceModelBadRequest(e)

        else:
            try:
                result = self.model.query.filter_by(id=id_, **filters).first()
            except InvalidRequestError as e:
                raise ResourceModelBadRequest(e)

            if not result:
                raise NotFound("resource with the given id not found (after applying filters)",
                               requestedId=id_,
                               filters=request.args)

        result = self.schema.dump(result, many=many)
        print(result)
        if many and do_pagination:
            return {
                "data": result,
                "_pagination": {
                    "currentPage": pagination.page,
                    "totalItems": pagination.total,
                    "perPage": pagination.per_page,
                    "nextPage": pagination.next_num,
                    "prevPage": pagination.prev_num,
                    "hasNext": pagination.has_next,
                    "hasPrev": pagination.has_prev
                }
            }
        else:
            return {"data": result}


class ImplementsGetOne(_ImplementsGet):
    model: Model
    schema: BaseAutoSchema

    def get(self, id_, *args, **kwargs):
        return super().get(*args, id_=id_, many=False, **kwargs)



class ImplementsGetCollection(_ImplementsGet):
    model: Model
    schema: BaseAutoSchema

    def get(self, *args, **kwargs):
        return super().get(*args, many=True, **kwargs)



def safe_patch(function):
    @jwt_required
    @easy_needs_privileges(PRIVILEGE_ACTION_EDIT)
    @safe_marshmallow
    @no_nested
    @integrity
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)
    return decorator



class ImplementsPatchOne:
    model: Model
    schema: BaseAutoSchema
    privileges = List[str]

    @safe_patch
    def patch(self, id_):
        body = request.get_json()
        body["id"] = id_  # force id_

        updated_student = self.schema.load(body, partial=True)
        merged = db.session.merge(updated_student)
        """if not result:
                    raise NotFound("resource with the given id not found", requestedId=id_)"""

        db.session.commit()

        return self.schema.dump(merged)


def safe_post(function):
    @jwt_required
    @easy_needs_privileges(PRIVILEGE_ACTION_CREATE)
    @safe_marshmallow
    @no_nested
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)
    return decorator


class ImplementsPostOne:
    model: Model
    schema: BaseAutoSchema

    @safe_post
    def post(self):
        body = request.get_json()
        if "id" in body:
            raise ResourceBaseBadRequest("post does not admit id argument",
                                         messages={"id": ["Found value '%s', expects no id." % body["id"]]})

        new_id = generate_new_id(db, model=self.model)
        body["id"] = new_id

        """if "guardians" in body:
            used_uncommitted_ids = [new_id]
            for guardian in body["guardians"]:
                guardian_id = generate_new_person_id(db, avoid=used_uncommitted_ids)
                guardian["id"] = guardian_id
                used_uncommitted_ids.append(guardian_id)"""

        new = self.schema.load(body)
        db.session.add(new)
        db.session.commit()

        return {"id": new_id}


def safe_delete(function):
    @jwt_required
    @easy_needs_privileges(PRIVILEGE_ACTION_DELETE)
    def decorator(*args, **kwargs):
        return function(*args, **kwargs)
    return decorator


class ImplementsDeleteOne:
    model: Model
    schema: BaseAutoSchema

    @safe_delete
    def delete(self, id_):
        result = db.session.query(self.model).filter_by(id=id_).first()

        """delete_guardians = request.args.get('deleteGuardians')
        if delete_guardians:
            delete_guardians = bool(int(delete_guardians))
            if delete_guardians:
                for guardian in student.guardians:
                    db.session.delete(guardian)"""
        if not result:
            raise NotFound("resource with the given id not found", requestedId=id_)

        db.session.delete(result)
        db.session.commit()


