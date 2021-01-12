import os, sys, subprocess, platform

import pdfkit


def get_config():
    if platform.system() == "Windows":
        return pdfkit.configuration(
            wkhtmltopdf=os.environ.get('wkhtmltopdf'))
    else:
        os.environ['PATH'] += os.pathsep + os.path.dirname(sys.executable)
        wkhtmltopdfcmd = subprocess.Popen(['which', os.environ.get('wkhtmltopdf')],
                                           stdout=subprocess.PIPE).communicate()[0].strip()
        return pdfkit.configuration(wkhtmltopdf=os.environ.get('wkhtmltopdf'))
