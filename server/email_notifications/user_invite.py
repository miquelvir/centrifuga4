from .utils.localized_email import LocalizedEmail
from .utils.email_sender import EmailSender


def send_user_invite_email(user_email, urls, config):
    emailer = EmailSender()

    emailer.send(
        LocalizedEmail(template_name="user_invite", to=[user_email], variables={**urls}),
        config=config
    )
