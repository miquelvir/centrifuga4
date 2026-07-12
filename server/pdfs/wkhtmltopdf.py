import os
import shutil

import pdfkit


def get_config():
    env_path = os.environ.get("wkhtmltopdf")
    if env_path:
        env_path = env_path.strip()
        if env_path and os.path.exists(env_path) and os.access(env_path, os.X_OK):
            return pdfkit.configuration(wkhtmltopdf=env_path)

    for path in [
        "/usr/bin/wkhtmltopdf",
        "/app/bin/wkhtmltopdf",
        "/app/.apt/usr/bin/wkhtmltopdf",
        "/usr/local/bin/wkhtmltopdf",
    ]:
        if os.path.exists(path) and os.access(path, os.X_OK):
            return pdfkit.configuration(wkhtmltopdf=path)

    which_path = shutil.which("wkhtmltopdf")
    if which_path:
        return pdfkit.configuration(wkhtmltopdf=which_path)

    raise RuntimeError(
        "No wkhtmltopdf executable could be found. Install wkhtmltopdf or provide a valid wkhtmltopdf path."
    )
