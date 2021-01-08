import os
import pathlib
from datetime import datetime

import jwt
import pdfkit

from jinja_utils.template_renderer import TemplateRenderer


TEMPLATES_PATH = os.path.join(pathlib.Path(__file__).parent.absolute(), 'templates')


def generate_payment_recipe_pdf(secret, payment, backend_url, templates_folder=TEMPLATES_PATH):
    def unix_time_millis():
        epoch = datetime.utcfromtimestamp(0)
        return int((datetime.now() - epoch).total_seconds() * 1000.0)

    config = pdfkit.configuration(wkhtmltopdf='/usr/bin/wkhtmltopdf')

    signing_at = unix_time_millis()
    try:
        student = payment.student[0]
        student_name = student.full_name.title()
        student_id = student.id
    except IndexError:
        raise

    token = jwt.encode({'studentId': student_id,
                        'paymentId': payment.id,
                        'studentName': student_name,
                        'paymentMethod': payment.method,
                        'paymentDate': str(payment.date),
                        'paymentQuantity': "%s EUR" % payment.quantity,
                        "iat": signing_at},
                       secret,
                       algorithm='HS256')

    templater = TemplateRenderer(templates_folder=templates_folder)
    pdf_content = templater.render_template("payment_recipe.html",
                                            server_address=backend_url,
                                            full_name=student_name,
                                            quantity=payment.quantity,
                                            date=payment.date,
                                            method=payment.method,
                                            today=datetime.date(datetime.now()),
                                            today_extended=signing_at,
                                            payment_id=payment.id,
                                            verification_link="%s/validation/v1/%s" % (
                                            backend_url,
                                            token.decode('utf-8')))

    pdf = pdfkit.from_string(pdf_content, False,
                             configuration=config)

    return pdf
