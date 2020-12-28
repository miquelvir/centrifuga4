from flask import current_app

from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from urllib.parse import urlencode, urlparse, parse_qs

from email_queue.url_utils import merge_url_query_params


def my_job(token, email, username):
    def generate_password_reset_link(_token, _username):
        return merge_url_query_params(
            "%s/password-reset" % current_app.config["FRONTEND_SERVER_URL"],
            {"token": _token, "username": _username})
    emailer = EmailSender()
    emailer.send(Email(
        "hi, password reset!",
        to=["vazquezrius.miquel@gmail.com"],
        plain_body="hello :) %s" % generate_password_reset_link(token, username)
    ))
