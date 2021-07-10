import io

import server
from server.emails.my_email import Email
from server.emails.email_sender import EmailSender
from server.pdfs.enrolment import generate_enrolment_agreement_pdf


def my_job(student, to, backend_server_address):
    emailer = EmailSender()

    app = server.init_app()
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
