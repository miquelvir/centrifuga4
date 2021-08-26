import io

import server
from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING

from ..pdfs.grant_letter import generate_grant_letter_pdf


def send_grant_letter_email(student, backend_server_address):
    emailer = EmailSender()

    app = server.init_app()  # todo check
    with app.app_context():
        pdf = generate_grant_letter_pdf(
            student['id'], backend_server_address=backend_server_address
        )

    emailer.send(
        LocalizedEmail(
            template_name="grant_letter",
            to=student['official_notification_emails'],
            variables={"id": student['id']},
            files=[(io.BytesIO(pdf), "grants-%s.pdf" % student['id'])],
        )
    )


