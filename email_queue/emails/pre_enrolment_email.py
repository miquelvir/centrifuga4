import io

import centrifuga4
from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from pdfs.grant_letter import generate_grant_letter_pdf


def my_job(to, id_):
    emailer = EmailSender()

    emailer.send(
        Email(
            "Xamfrà - prematrícula | pre-enrolment",
            to=to,
            plain_body="Prematrícula completada amb èxit! El vostre codi de prematriculació es troba a continuació.\n"
            "¡Prematrícula completada con éxito! Vuestro código de prematrícula se encuentra a continuación.\n"
            "Pre-enrolment was successful! Your pre-enrolment code can be found below.\n"
            "\n\nID: %s" % id_,
        )
    )
