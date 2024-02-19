from typing import TYPE_CHECKING

from dependency_injector.wiring import Provide, inject
from flask import Blueprint, g, request, current_app, session, abort, jsonify
from server.containers import Container
from server.services.totp_service import TotpService
import requests

# initialise the blueprint
from flask_login import login_user, logout_user, login_required, current_user

from server.models import User, Role

auth_blueprint = Blueprint("auth", __name__)


def audit_login(emoji: str, ip: str, username: str, result: str):
    requests.post(current_app.config.DISCORD_LOGIN_NOTIFICATIONS, json={
        "content": f"[{emoji}] [{username}] [{ip}] {result}"
    })


def get_ip():
    if request.environ.get('HTTP_X_FORWARDED_FOR') is None:
        return request.environ['REMOTE_ADDR']
    else:
        return request.environ['HTTP_X_FORWARDED_FOR'] # if behind a proxy


def basic_http_auth_required(f):
    def verify_password(username: str, password: str) -> bool:
        """Given a username and optionally a password, verify its validity."""

        user = User.query.filter(User.email == username).first()
        if user is None:
            return False  # user not registered

        if not user.login(password):
            return False  # password does not match

        g.user = user
        return True

    @inject
    def verify_totp(
        totp, user, totp_service: TotpService = Provide[Container.totp_service]
    ) -> bool:
        return totp_service.is_valid(
            totp_service.decrypt_totp_secret(user.totp_secret), totp
        )

    def wrapper(*args, **kwargs):
        auth = request.authorization  # first factor
        totp = request.args.get("totp", None)  # second factor (2FA)
        if not (totp and auth):  # missing fields
            audit_login("⚠️", get_ip(), "?", "Failed (missing totp or auth)")
            abort(401)
        if not verify_password(auth.username, auth.password):  # wrong first factor
            audit_login("⚠️", get_ip(), auth.username, "Failed (invalid password or username)")
            abort(401)
        if not verify_totp(totp, g.user):  # wrong second factor
            audit_login("⚠️", get_ip(), auth.username, "Failed (invalid totp)")
            abort(401)

        audit_login("✅", get_ip(), auth.username, "Successful")
        return f(*args, **kwargs)

    return wrapper


def get_current_needs():
    """returns a json object with the needs of the current user"""
    result = {}

    if hasattr(current_user, "role") and current_user.role is not None:
        result["role"] = current_user.role.id

        if current_user.role.id == Role.TEACHER:
            result["teacher"] = {}
            result["teacher"]["id"] = current_user.teacher_id
            result["teacher"]["name"] = current_user.name
        else:
            result["teacher"] = None

    return jsonify(result)


@auth_blueprint.route("/login", methods=["POST"])
@basic_http_auth_required  # require user and password to be validated
def login():
    """
    In the before_request, the user is required to login. When reaching this endpoint, the user is already validated.
        // pre-condition: g.user has the user name
    Given a username, it generates the jwt_token and send it to the client.
    The client must store it for future calls.
    """
    user = g.user

    remember_me = True if request.args.get("rememberMe", None) == "1" else False
    login_user(user, remember=remember_me)

    return get_current_needs()


@auth_blueprint.route("/logout", methods=["GET"])
@login_required
def logout():
    """
    # Because the JWTs are stored in an httponly cookie now, we cannot
    # log the user out by simply deleting the cookie in the frontend.
    # We need the backend to send us a response to delete the cookies
    # in order to logout. unset_jwt_cookies is a helper function to
    # do just that.
    """
    logout_user()

    current_app.login_manager._update_request_context_with_user()

    session.clear()

    return "", 200


@auth_blueprint.route("/ping", methods=["GET"])
@login_required
def ping():
    # will break if login is disabled, as in wsgi_development config
    return get_current_needs()
