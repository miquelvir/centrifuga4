import io

import centrifuga4
from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from pdfs.enrollment import generate_enrollment_agreement_pdf


def my_job(student, to, backend_server_address):
    emailer = EmailSender()

    app = centrifuga4.init_app()
    with app.app_context():
        pdf = generate_enrollment_agreement_pdf(student.id, backend_server_address=backend_server_address)

    emailer.send(Email(
        "Xamfrà - matrícula | enrollment",
        to=to,
        plain_body="Document de matrícula adjunt\nDocumento de matrícula adjunto\nEnrollment agreement attached",
        files=[(io.BytesIO(pdf), "enrollment-%s.pdf" % student.id)]
    ))
