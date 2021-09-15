from threading import Thread

from flask import current_app

from server.email_notifications.utils.url_utils import merge_url_query_params
from server.models import Student, User
from server import signals

from server.email_notifications.pre_enrolled import send_pre_enrolled_email
from server.email_notifications.password_reset_request import (
    send_password_reset_request_email,
)
from server.email_notifications.password_reset_redeem import (
    send_password_reset_redeem_email,
)
from server.schemas.schemas import StudentSchema, UserSchema


def when_student_enrolled(_, student: Student) -> None:
    thread = Thread(
        target=send_pre_enrolled_email,
        args=(
            StudentSchema().dump(student),
            current_app.config.copy(),
        ),
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
        target=send_password_reset_request_email,
        args=(
            UserSchema().dump(user),
            {
                "url_ca": generate_password_reset_url(user, token, "cat"),
                "url_en": generate_password_reset_url(user, token, "eng"),
            },
            current_app.config.copy(),
        ),
    )
    thread.start()


def when_user_password_changed(_, user: User) -> None:
    thread = Thread(
        target=send_password_reset_redeem_email,
        args=(
            UserSchema().dump(user),
            current_app.config.copy(),
        ),
    )
    thread.start()


def add_subscribers():
    signals.student_pre_enrolled.connect(when_student_enrolled)
    signals.user_password_reset_request.connect(when_user_password_reset_request)
    signals.user_password_changed.connect(when_user_password_changed)
