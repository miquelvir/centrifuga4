from server.emails.my_email import Email
from server.emails.email_sender import EmailSender


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
