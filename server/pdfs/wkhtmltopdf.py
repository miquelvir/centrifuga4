import os
import shutil

import pdfkit


def get_config():
    wkhtmltopdf_path = os.environ.get("wkhtmltopdf") or shutil.which("wkhtmltopdf")
    return pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
