from datetime import datetime
from functools import wraps

from flask import jsonify, make_response, request
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError, InvalidRequestError
from werkzeug.exceptions import HTTPException


class ApiException(HTTPException):
    def __init__(self, message=None, type_=None, **kwargs):
        body = {
            "message": message,
            "type": (type(self) if not type_ else type_).__name__,
            "status": self.code,
            "localTimestamp": datetime.now().isoformat(),
            "utcTimestamp": datetime.utcnow().isoformat(),
            "requestBody": request.get_json(),
            "detail": kwargs,
            "requestUrl": request.url
        }
        super().__init__(response=make_response(jsonify({"error": body}),
                                                self.code))


class Unauthorized(ApiException):
    code = 401

    def __init__(self, message, **kwargs):
        super().__init__(type_=NotFound, message=message, **kwargs)


class Forbidden(ApiException):
    code = 403

    def __init__(self, message, **kwargs):
        super().__init__(type_=NotFound, message=message, **kwargs)


class NotFound(ApiException):
    code = 404

    def __init__(self, message, **kwargs):
        super().__init__(type_=NotFound, message=message, **kwargs)


class BaseBadRequest(ApiException):
    code = 400

    def __init__(self, message, **kwargs):
        super().__init__(type_=BaseBadRequest, message=message, **kwargs)


class NestedNotAllowedBadRequest(BaseBadRequest):
    def __init__(self, message, messages):
        body = {
            "fields": {
                field: messages[field] for field in messages
            }
        }
        super().__init__(message, **body)


class ResourceBaseBadRequest(BaseBadRequest):
    def __init__(self, message, messages=None):
        if messages is None:
            messages = {}
        body = {
            "fields": messages
        }
        super().__init__(message, **body)


class ResourceMarshmallowBadRequest(ResourceBaseBadRequest):
    def __init__(self, exception: ValidationError):
        super().__init__("Invalid field when trying to load with Schema.",
                         messages=exception.messages)


class ResourceModelBadRequest(ResourceBaseBadRequest):
    def __init__(self, exception: InvalidRequestError):
        super().__init__("Invalid field when trying to fit to Model.",
                         messages=str(exception))


def safe_marshmallow(function):
    def function_wrapper(*args, **kwargs):
        """ raise proper api error if can't load given data with marshmallow schema """

        try:
            return function(*args, **kwargs)
        except ValidationError as e:
            raise ResourceMarshmallowBadRequest(e)
    return function_wrapper


def integrity(function):
    def function_wrapper(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except IntegrityError as e:
            raise BaseBadRequest(e.args)
    return function_wrapper


def no_nested(function):
    def function_wrapper(*args, **kwargs):
        for key, value in request.get_json().items():
            if type(value) not in (str, int, float, bool, type(None)):
                print(request.args, request.access_route, request.view_args, )
                raise NestedNotAllowedBadRequest(
                    "use proper sub resource instead of nested objects",
                    {key:
                         ["No nesting is allowed.",
                          "You might want to %s at '%s%s/%s/...'." %
                          (request.method, request.host_url, request.path[1:], key)]})

        try:
            return function(*args, **kwargs)
        except IntegrityError as e:
            raise BaseBadRequest(e.args)
    return function_wrapper
