import datetime
from threading import Thread
from typing import Optional
from flask import current_app

from server import db
from server.blueprints.user_invites.schemas.user_invite_jwt_body import UserInviteJwtBody
from server.email_notifications.utils.url_utils import merge_url_query_params
from server.models import User, Role

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.services.jwt_service import JwtService

USER_INVITE_TOKEN_EXPIRES_IN = datetime.timedelta(
    minutes=10
)


class UserInvitesService:
    def __init__(self, jwt_service: 'JwtService'):
        self.jwt_service = jwt_service

    @staticmethod
    def is_role_id_valid(role_id: str) -> bool:
        if role_id is None:
            return True
        if Role.query.filter(Role.id == role_id).count() == 0:
            return False
        return True

    @staticmethod
    def is_user_email_available(email: str) -> bool:
        if User.query.filter(User.email == email).count() > 0:
            return False
        return True

    @staticmethod
    def get_role(id_: str) -> Optional[Role]:
        return Role.query.filter(Role.id == id_).one_or_none()

    def generate_token(self, jwt_body: UserInviteJwtBody):
        return self.jwt_service.encode(jwt_body.dict(),
                                        expires_in=USER_INVITE_TOKEN_EXPIRES_IN)

    # no-unittest
    def send_invite(self, email, token):
        from server.email_notifications.user_invite import send_user_invite_email

        Thread(
            target=send_user_invite_email,
            args=(email, self.get_signup_urls(token, email)),
        ).start()

    @staticmethod
    def get_signup_urls(_token, _email, frontend_url=None):
        return {
            "url_ca": merge_url_query_params(
                "%s/app/signup"
                % (
                    frontend_url
                    if frontend_url
                    else current_app.config["FRONTEND_SERVER_URL"]
                ),
                {"token": _token, "email": _email, "lan": "cat"},
            ),
            "url_en": merge_url_query_params(
                "%s/app/signup"
                % (
                    frontend_url
                    if frontend_url
                    else current_app.config["FRONTEND_SERVER_URL"]
                ),
                {"token": _token, "email": _email, "lan": "eng"},
            ),
        }

    @staticmethod
    def save_user(user: User):
        db.session.add(user)
        db.session.commit()
