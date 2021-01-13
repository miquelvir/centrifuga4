import os

import pdfkit


def get_config():
    return pdfkit.configuration(wkhtmltopdf=os.environ.get("wkhtmltopdf"))
