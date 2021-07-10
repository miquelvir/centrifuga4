from server.emails.my_email import Email
from server.emails.email_sender import EmailSender


def my_job(emails, subject, body, files):
    emailer = EmailSender.init_bulk()
    emailer.send(Email(subject, bcc=emails, plain_body=body, files=files))


if __name__ == "__main__":
    my_job(["vazquezrius.miquel@gmail.com"], "hi", "hiiii")
