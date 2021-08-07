import io

import server
from server.emails.my_email import Email
from server.emails.email_sender import EmailSender
from server.pdfs.grant_letter import generate_grant_letter_pdf


def my_job(student, to, backend_server_address):
    emailer = EmailSender()

    app = server.init_app()

    with app.app_context():
        pdf = generate_grant_letter_pdf(
            student.id, backend_server_address=backend_server_address
        )

    emailer.send(
        Email(
            "Xamfrà - beques | becas | grants",
            to=to,
            plain_body="Confirmació de beques adjunta\nConfirmación de becas adjunta\nGrants confirmation attached",
            files=[(io.BytesIO(pdf), "grants-%s.pdf" % student.id)],
        )
    )
