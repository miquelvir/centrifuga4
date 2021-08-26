from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender
from typing import TYPE_CHECKING


def send_user_invite_email(user_email, urls):
    emailer = EmailSender()

    emailer.send(
        LocalizedEmail(
            template_name="user_invite",
            to=[user_email],
            variables={
                **urls
            }
        )
    )
