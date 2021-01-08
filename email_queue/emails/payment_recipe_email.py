import io

from email_queue.my_email import Email
from email_queue.email_sender import EmailSender

from jinja_utils.template_renderer import TemplateRenderer
from pdfs.payment_recipe import generate_payment_recipe_pdf


def my_job(payment, to, secret, backend_url):
    emailer = EmailSender()

    pdf = generate_payment_recipe_pdf(secret,
                                      payment,
                                      backend_url)

    emailer.send(Email(
        "Xamfrà - pagament (rebut)",
        to=to,
        plain_body="Rebut del pagament adjunt ({quantity}€).\nRecibo del pago adjunto ({quantity}€).\nPayment receipt attached ({quantity}€).".format(quantity=payment.quantity),
        files=[io.BytesIO(pdf), "%s.pdf" % payment.id]
    ))
