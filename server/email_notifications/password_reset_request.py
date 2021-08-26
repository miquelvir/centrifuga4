from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING, Dict


def send_password_reset_request_email(user, urls: Dict[str, str]):
    emailer = EmailSender()

    emailer.send(
        LocalizedEmail(
            template_name="password_reset_request",
            to=[user["email"]],
            variables={**urls},
        )
    )
