import io

import server
from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING

from ..pdfs.enrolment import generate_enrolment_agreement_pdf
from ..pdfs.grant_letter import generate_grant_letter_pdf


def send_enrolment_agreement_email(student, backend_server_address):
    emailer = EmailSender()

    app = server.init_app()  # todo
    with app.app_context():
        pdf = generate_enrolment_agreement_pdf(
            student['id'], backend_server_address=backend_server_address
        )

    emailer.send(
        LocalizedEmail(
            template_name="enrolment_agreement",
            to=student['official_notification_emails'],
            files=[(io.BytesIO(pdf), "enrolment-%s.pdf" % student['id'])],
        )
    )


