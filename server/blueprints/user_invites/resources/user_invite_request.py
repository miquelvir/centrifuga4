import datetime
from threading import Thread

import jwt
from dependency_injector.wiring import Provide
from flask import request, current_app
from flask_login import fresh_login_required
from flask_restful import Resource
from pydantic import BaseModel, ValidationError

from server.auth_auth.require import Require
from server.auth_auth.special_permissions import UserInvitePermission
from server.blueprints.user_invites.schemas.user_invite_jwt_body import (
    UserInviteJwtBody,
)
from server.containers import Container
from server.models import User, Role
from server.email_notifications.user_invite import send_user_invite_email
from server.email_notifications.utils.url_utils import merge_url_query_params
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from server.services.jwt_service import JwtService
    from ..services.user_invites_service import UserInvitesService

USER_INVITE_TOKEN_EXPIRES_IN = datetime.timedelta(days=7)


class UserInviteRequest(BaseModel):
    user_email: str
    role_id: Optional[str]


class UserInviteRequestCollectionRes(Resource):
    @fresh_login_required
    def post(
        self,
        user_invites_service: "UserInvitesService" = Provide[
            Container.user_invites_service
        ],
    ):
        Require.ensure.create(UserInvitePermission())

        try:
            body = UserInviteRequest(**request.json)
        except ValidationError as e:
            return e.json(), 400

        if not user_invites_service.is_role_id_valid(body.role_id):
            return f"Invalid role_id supplied.", 400

        if not user_invites_service.is_user_email_available(body.user_email):
            return "There already exists a user with the provided email.", 400

        token = user_invites_service.generate_token(UserInviteJwtBody(**body.dict()))
        user_invites_service.send_invite(body.user_email, token)

        return "", 200
