from threading import Thread

from flask import current_app

from server.emails.url_utils import merge_url_query_params
from server.models import Student, User
from server import signals

from server.emails.emails.pre_enrolment_email import (
    my_job as pre_enrolment_email_job,
)  # todo rename
from server.emails.emails.password_reset_email import (
    my_job as password_reset_email_job,
)  # todo rename
from server.emails.emails.password_change_email import (
    my_job as password_changed_email_job,
)  # todo rename


def when_student_enrolled(_, student: Student) -> None:
    thread = Thread(
        target=pre_enrolment_email_job,
        args=(student.official_notification_emails, student.id),
    )
    thread.start()


def when_user_password_reset_request(_, user: User, token: str) -> None:
    def generate_password_reset_url(
        user: User,
        token: str,
        language: str = "eng",
        frontend_url: str = current_app.config["FRONTEND_SERVER_URL"],
    ) -> str:
        """:returns url where password can be reset (with the token, email and language as url parameters)"""
        reset_page_url = f"{frontend_url}/app/password-reset"
        query_parameters = {"token": token, "email": user.email, "lan": language}
        return merge_url_query_params(reset_page_url, query_parameters)

    thread = Thread(
        target=password_reset_email_job,
        args=(
            generate_password_reset_url(user, token, "cat"),
            generate_password_reset_url(user, token, "eng"),
            user.email,
        ),
    )
    thread.start()


def when_user_password_changed(_, user: User) -> None:
    thread = Thread(target=password_changed_email_job, args=(user.email,))
    thread.start()


def add_subscribers():
    signals.student_pre_enrolled.connect(when_student_enrolled)
    signals.user_password_reset_request.connect(when_user_password_reset_request)
    signals.user_password_changed.connect(when_user_password_changed)
