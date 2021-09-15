from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING


def send_password_reset_redeem_email(user, config):
    emailer = EmailSender()

    emailer.send(
        LocalizedEmail(template_name="password_reset_redeem", to=[user["email"]]),
        config=config,
    )
