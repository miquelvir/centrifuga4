import os
import pathlib
from datetime import datetime

import jwt
import pdfkit

from centrifuga4.models import Student
from centrifuga4.schemas.schemas import StudentSchema, GuardianSchema, CourseSchema
from jinja_utils.template_renderer import TemplateRenderer
from pdfs import TEMPLATES_PATH
from pdfs.wkhtmltopdf import get_config


def generate_enrollment_agreement_pdf(student_id, backend_server_address, templates_folder=TEMPLATES_PATH):
    config = pdfkit.configuration(wkhtmltopdf=get_config())

    student = Student.query.filter(Student.id == student_id).one_or_none()
    if not student:
        return
    templater = TemplateRenderer(templates_folder=templates_folder)
    total_price = sum([c.price_term for c in student.courses])
    gs = GuardianSchema()
    cs = CourseSchema()
    pdf_content = templater.render_template("enrollment.html",
                                            server_address=backend_server_address,
                                            student_name=student.full_name.title(),
                                            courses=[cs.dump(c) for c in student.courses],
                                            paid_price=student.price_term,
                                            anual_paid_price=student.price_term*3,
                                            total_price=total_price,
                                            grant=total_price > student.price_term,
                                            grant_percentage=round(student.price_term/total_price*100, 2) if total_price != 0 else 0,
                                            datetime=datetime.date(datetime.now()),
                                            student=StudentSchema().dump(student),
                                            guardians=[gs.dump(g) for g in student.guardians],
                                            schedules=student.get_course_schedules())

    pdf = pdfkit.from_string(pdf_content, False,
                             configuration=config)

    return pdf
