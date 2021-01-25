import io

import centrifuga4
from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from pdfs.enrolment import generate_enrolment_agreement_pdf


def my_job(student, to, backend_server_address):
    emailer = EmailSender()

    app = centrifuga4.init_app()
    with app.app_context():
        pdf = generate_enrolment_agreement_pdf(
            student.id, backend_server_address=backend_server_address
        )

    emailer.send(
        Email(
            "Xamfrà - matrícula | enrolment",
            to=to,
            plain_body="Document de matrícula adjunt\nDocumento de matrícula adjunto\nEnrolment agreement attached",
            files=[(io.BytesIO(pdf), "enrolment-%s.pdf" % student.id)],
        )
    )
