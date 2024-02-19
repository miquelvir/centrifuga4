import jwt
from dependency_injector.wiring import Provide
from flask import request
from flask_restful import Resource

from server.blueprints.user_invites.schemas.user_invite_jwt_body import (
    UserInviteJwtBody,
)
from server.containers import Container
from server.models import User

from pydantic import BaseModel, ValidationError
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.services.jwt_service import JwtService
    from server.services.totp_service import TotpService
    from server.blueprints.user_invites.services.user_invites_service import (
        UserInvitesService,
    )

from server.services.audit_service import audit_log_alert


class UserInviteRedeem(BaseModel):
    name: str
    surname1: str
    surname2: str
    password: str
    token: str


class UserInviteRedeemRes(Resource):
    def post(
        self,
        jwt_service: "JwtService" = Provide[Container.jwt_service],
        user_invites_service: "UserInvitesService" = Provide[
            Container.user_invites_service
        ],
        totp_service: "TotpService" = Provide[Container.totp_service],
    ):
        try:
            body = UserInviteRedeem(**request.json)
        except ValidationError as e:
            audit_log_alert(f"User invite redeem failed (invalid body)")
            return e.json(), 400

        try:
            data = jwt_service.decode(body.token)
        except jwt.ExpiredSignatureError:
            audit_log_alert(f"User invite redeem failed (token expired)")
            # this is a specific case of the following clause
            return "token expired", 401
        except jwt.InvalidTokenError:
            audit_log_alert(f"User invite redeem failed (invalid token)")
            return "invalid token", 401

        try:
            data = UserInviteJwtBody(**data)
        except ValidationError as e:
            audit_log_alert(f"User invite redeem failed (invalid token body)")
            return f"Invalid token body. {e.json()}", 400

        if not user_invites_service.is_user_email_available(data.user_email):
            audit_log_alert(f"User invite redeem failed (user already exists). Email: {data.user_email}")
            return "user already exists", 400

        if not user_invites_service.is_role_id_valid(data.role_id):
            audit_log_alert(f"User invite redeem failed (invalid role id). Email: {data.user_email}")
            return f"invalid role with role_id={data.role_id!r}", 400

        user_id = User.generate_new_id()
        totp_secret = totp_service.generate_totp_secret()

        user = User(
            id=user_id,
            name=body.name,
            surname1=body.surname1,
            surname2=body.surname2,
            email=data.user_email,
            password_hash=User.hash_password(body.password),
            role_id=data.role_id,
            totp_secret=totp_service.encrypt_totp_secret(totp_secret),
        )

        user_invites_service.save_user(user)

        audit_log_alert(f"User invite redeem successful. Email: {data.user_email}")

        return {
            "user_id": user_id,
            "totp": totp_service.generate_url(totp_secret, user.email),
        }, 200
