import io
from typing import Union

from flask import make_response, send_file


def string_io_to_bytes_io(string_io: io.StringIO, encoding="utf-8") -> io.BytesIO:
    """ converts string io to bytes io

    :returns the BytesIO at the start of the file
    """
    bytes_io = io.BytesIO()

    # copy StringIO content to BytesIO
    bytes_io.write(string_io.getvalue().encode(encoding))

    # go to start of line (Flask send_file requires it)
    bytes_io.seek(0)

    return bytes_io


def make_response_with_file(
    proxy: Union[io.BytesIO, io.StringIO],
    filename: str,
    mime_type: str,
    encoding="utf-8",
    as_attachment=True,
):
    """ create a flask response attaching a string_io or bytes_io object """
    r = make_response(
        send_file(
            proxy
            if type(proxy) is io.BytesIO
            else string_io_to_bytes_io(proxy, encoding=encoding),
            as_attachment=as_attachment,
            mimetype=mime_type,
            attachment_filename=filename,
        )
    )

    # allow the receiver to access the filename
    r.headers["Access-Control-Expose-Headers"] = "content-disposition"

    # return the response
    return r
