from server.emails.my_email import Email
from server.emails.email_sender import EmailSender

from server.jinja_utils.template_renderer import TemplateRenderer


def my_job(url_cat, url_eng, email):
    emailer = EmailSender()
    templater = TemplateRenderer()
    emailer.send(
        Email(
            "centrífuga4 - sign up invite 📯",
            to=[email],
            html_body=templater.render_template(
                "invite_email.html", url_cat=url_cat, url_eng=url_eng
            ),
        )
    )
