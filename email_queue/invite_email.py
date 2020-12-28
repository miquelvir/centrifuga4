from flask import current_app

from email_queue.my_email import Email
from email_queue.email_sender import EmailSender
from urllib.parse import urlencode, urlparse, parse_qs

from email_queue.url_utils import merge_url_query_params


def my_job(token, email):
    def generate_signup_link(_token, _email):
        return merge_url_query_params(
            "%s/signup" % current_app.config["FRONTEND_SERVER_URL"],
            {"token": _token, "email": _email})
    emailer = EmailSender()
    emailer.send(Email(
        "hi, welcome!",
        to=["vazquezrius.miquel@gmail.com"],
        plain_body="hello :) %s" % generate_signup_link(token, email)
    ))
