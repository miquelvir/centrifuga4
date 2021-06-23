from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from jinja_utils.template_renderer import TemplateRenderer


def my_job(to):
    emailer = EmailSender()
    templater = TemplateRenderer()
    emailer.send(
        Email(
            "centrífuga4 - password reset completed 🔐",
            to=[to],
            html_body=templater.render_template("password_reset_email.html"),
        )
    )
