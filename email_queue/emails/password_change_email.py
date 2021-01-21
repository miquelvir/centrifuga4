import io

import centrifuga4
from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from pdfs.grant_letter import generate_grant_letter_pdf


def my_job(to):
    emailer = EmailSender()

    emailer.send(
        Email(
            "centrífuga4 - password reset completed 🔐",
            to=[to],
            plain_body="Your password has been changed successfully! "
            "Contact admin ASAP if you did not request and complete this change.",
        )
    )
