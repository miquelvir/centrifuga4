import io

from server.emails.my_email import Email
from server.emails.email_sender import EmailSender
from server.pdfs.payment_receipt import generate_payment_recipe_pdf


def my_job(payment, to, secret, backend_url):
    emailer = EmailSender()

    pdf = generate_payment_recipe_pdf(secret, payment, backend_url)

    emailer.send(
        Email(
            "Xamfrà - rebut | recibo | receipt",
            to=to,
            plain_body="Rebut del pagament adjunt ({quantity}€)\nRecibo del pago adjunto ({quantity}€)\nPayment receipt attached ({quantity}€)".format(
                quantity=payment.quantity
            ),
            files=[(io.BytesIO(pdf), "receipt-%s.pdf" % payment.id)],
        )
    )
