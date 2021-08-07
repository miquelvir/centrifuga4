import csv
import io
from datetime import datetime

from typing import Union, Tuple

from flask import request, jsonify

from server.blueprints.api.errors import BaseBadRequest
from server.constants import SHORT_NAME
from server.file_utils.string_bytes_io import make_response_with_file
from server.models import Student


def to_file(function):
    def wrapper(*args, **kwargs):
        proxy = io.StringIO()
        _ = function(*args, **kwargs, proxy=proxy)  # writes to proxy
        f = io.BytesIO()
        f.write(proxy.getvalue().encode("utf-8"))
        f.seek(0)
        proxy.close()
        return f

    return wrapper


class Flattener:
    def __init__(self):
        pass

    @to_file
    def flatten_to_csv(self, _result: Student, src, proxy=None):
        if proxy is None:
            raise ValueError("proxy can't be none, value must be provided")

        matrix, keys = self.flatten(src, _result)
        keys = list(keys)
        keys.sort()
        dict_writer = csv.DictWriter(proxy, keys)
        dict_writer.writeheader()
        dict_writer.writerows(matrix)

    def flatten(self, src, _result):
        if type(src) is not list:
            src = [src]
            _result = [_result]

        matrix = []
        keys = set()
        for row, _res in zip(src, _result):
            flattened_row = self._flatten_row(row, _res)
            matrix.append(flattened_row)
            keys = keys | set(flattened_row.keys())
        return matrix, keys

    def _flatten_row(self, src: Union[list, dict], _result: Student):
        result = {}
        for key, value in src.items():
            if type(value) is list:
                result[key] = ", ".join([str(v) for v in value])
                try:
                    result[key + " [readable]"] = ", ".join(
                        [v.user_representation() for v in _result.__dict__[key]]
                    )
                except AttributeError:
                    pass
                except KeyError:
                    pass
            else:
                result[key] = str(value)
        return result


def produces(_accepted_mimetypes: Tuple[str, ...] = None):
    def decorator(function):
        def function_wrapper(*args, **kwargs):
            # check content type is ok
            requested_mimetypes = request.accept_mimetypes
            accepted_mimetypes = (
                _accepted_mimetypes if _accepted_mimetypes else ["application/json"]
            )

            if len(requested_mimetypes) == 0:
                match = accepted_mimetypes[
                    0
                ]  # default to the first mimetype of the accepted ones
            else:
                match = requested_mimetypes.best_match(accepted_mimetypes)
                if not match:
                    raise BaseBadRequest(
                        "unsupported accept mimeType header",
                        expected=[accepted_mimetypes],
                        received=requested_mimetypes,
                    )

            # call the actual endpoint
            _result, result = function(*args, **kwargs)

            # return in matched type
            if match == "application/json":
                return jsonify(result)
            elif match == "text/csv":
                extension = "csv"
                filename = "%s-export-%s-%s.%s" % (
                    SHORT_NAME,
                    type(args[0]).__name__,
                    datetime.now().strftime("%Y%m%dT%H%M%S"),
                    extension,
                )

                f = Flattener().flatten_to_csv(_result, result["data"])

                return make_response_with_file(f, filename, match, encoding="utf-8-sig")
            else:
                raise NotImplementedError("mimeType cast not implemented")

        return function_wrapper

    return decorator
