from email_queue.my_email import Email
from email_queue.email_sender import EmailSender


def my_job(name):
    emailer = EmailSender()
    emailer.send(Email(
        "hi, welcome!",
        to=["vazquezrius.miquel@gmail.com"],
        plain_body="hello :) %s" % name
    ))
