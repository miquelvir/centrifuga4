import io

from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING

from ..pdfs.payment_receipt import generate_payment_recipe_pdf


def send_payment_receipt_email(payment, student, secret, backend_url):
    emailer = EmailSender()

    pdf = generate_payment_recipe_pdf(secret, payment, student, backend_url)

    emailer.send(
        LocalizedEmail(
            template_name="payment_receipt",
            to=student["official_notification_emails"],
            variables={"quantity": payment["quantity"]},
            files=[(io.BytesIO(pdf), "receipt-%s.pdf" % payment["id"])],
        )
    )
