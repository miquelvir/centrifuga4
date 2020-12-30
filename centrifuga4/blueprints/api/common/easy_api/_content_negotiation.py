import csv
import io
from datetime import datetime

from typing import Union, Tuple

from flask import request, jsonify, send_file, make_response

from centrifuga4.blueprints.api.common.errors import BaseBadRequest
from centrifuga4.constants import SHORT_NAME


def to_file(function):
    def wrapper(*args, **kwargs):
        proxy = io.StringIO()
        _ = function(*args, **kwargs, proxy=proxy)  # writes to proxy
        f = io.BytesIO()
        f.write(proxy.getvalue().encode('utf-8'))
        f.seek(0)
        proxy.close()
        return f

    return wrapper


class Flattener:
    def __init__(self):
        pass

    @to_file
    def flatten_to_csv(self, src, proxy=None):
        if proxy is None:
            raise ValueError("proxy can't be none, value must be provided")

        matrix, keys = self.flatten(src)
        keys = list(keys)
        keys.sort()
        dict_writer = csv.DictWriter(proxy, keys)
        dict_writer.writeheader()
        dict_writer.writerows(matrix)

    def flatten(self, src):
        if type(src) is not list:
            src = [src]

        matrix = []
        keys = set()
        for row in src:
            flattened_row = self._flatten_row(row)
            matrix.append(flattened_row)
            keys = keys | set(flattened_row.keys())
        return matrix, keys

    def _flatten_row(self, src: Union[list, dict], upper_key: str = None, result=None):
        result = result if result is not None else {}
        if type(src) is list:
            for idx, value in enumerate(src):
                key = "%s_%s" % (upper_key, idx) if upper_key is not None else str(idx)
                _ = self._flatten_row(value, key, result)
        elif type(src) is dict:
            for local_key, value in src.items():
                key = "%s_%s" % (upper_key, local_key) if upper_key is not None else local_key
                _ = self._flatten_row(value, key, result)
        else:
            result[upper_key] = src
        return result


def produces(_accepted_mimetypes: Tuple[str, ...] = None):
    def decorator(function):
        def function_wrapper(*args, **kwargs):
            # check content type is ok
            requested_mimetypes = request.accept_mimetypes
            accepted_mimetypes = _accepted_mimetypes if _accepted_mimetypes else ["application/json"]

            if len(requested_mimetypes) == 0:
                match = accepted_mimetypes[0]  # default to the first mimetype of the accepted ones
            else:
                match = requested_mimetypes.best_match(accepted_mimetypes)
                if not match:
                    raise BaseBadRequest("unsupported accept mimeType header",
                                         expected=[accepted_mimetypes],
                                         received=requested_mimetypes)

            # call the actual endpoint
            result = function(*args, **kwargs)

            # return in matched type
            if match == "application/json":
                return jsonify(result)
            elif match == "text/csv":
                extension = "csv"
                filename = "%s-export-%s-%s.%s" % (SHORT_NAME,
                                                   type(args[0]).__name__,
                                                   datetime.now().strftime("%Y%m%dT%H%M%S"),
                                                   extension)

                f = Flattener().flatten_to_csv(result["data"])

                r = make_response(send_file(
                    f,
                    as_attachment=True,
                    mimetype=match,
                    attachment_filename=filename))
                r.headers["Access-Control-Expose-Headers"] = "content-disposition"
                return r
            else:
                raise NotImplementedError("mimeType cast not implemented")

        return function_wrapper

    return decorator
