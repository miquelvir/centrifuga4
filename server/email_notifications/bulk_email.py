from .utils.localized_email import ThemedEmail
from .utils.email_sender import EmailSender


def send_bulk_email(emails, subject, body, files):
    emailer = EmailSender.init_bulk()
    emailer.send(ThemedEmail(subject,
                             bcc=emails,
                             template_name="bulk_email",
                             variables={"_body": body},
                             files=files))

