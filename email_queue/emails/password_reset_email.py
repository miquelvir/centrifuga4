from flask import current_app

from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from urllib.parse import urlencode, urlparse, parse_qs

from email_queue.template_renderer import TemplateRenderer
from email_queue.url_utils import merge_url_query_params


def my_job(url_cat, url_eng, email):
    emailer = EmailSender()
    templater = TemplateRenderer()
    emailer.send(Email(
        "centrífuga4 - password reset 🔐",
        to=[email],
        html_body=templater.render_template("password_reset_email.html", url_cat=url_cat, url_eng=url_eng)
    ))
