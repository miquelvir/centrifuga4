from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Student


def send_pre_enrolled_email(student):
    emailer = EmailSender()

    emailer.send(
        LocalizedEmail(
            template_name="pre_enrolled",
            to=student["official_notification_emails"],
            variables={"id": student["id"]},
        )
    )
