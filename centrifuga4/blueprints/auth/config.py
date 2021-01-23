from functools import wraps

from flask import Blueprint, g, request, current_app, session, abort

# initialise the blueprint
from flask_login import login_user, logout_user, login_required
from flask_principal import identity_changed, Identity, AnonymousIdentity

from centrifuga4.models import User

auth_service = Blueprint("auth", __name__)


def basic_http_auth_required(f):
    def verify_password(username: str, password: str) -> bool:
        """ Given a username and optionally a password, verify its validity. """

        user = User.query.filter(User.email == username).first()
        if user is None:
            return False  # user not registered

        if not user.login(password):
            return False  # password does not match

        g.user = user
        return True

    def wrapper(*args, **kwargs):
        auth = request.authorization
        if not (auth and verify_password(auth.username, auth.password)):
            abort(401)
        return f(*args, **kwargs)

    return wrapper


@auth_service.route("/login", methods=["POST"])
@basic_http_auth_required  # require user and password to be validated
def get_auth_token():
    """
    endpoint to get a JWT for next calls


    In the before_request, the user is required to login. When reaching this endpoint, the user is already validated.
        // pre-condition: g.user has the user name
    Given a username, it generates the jwt_token and send it to the client.
    The client must store it for future calls.
    """

    user = g.user
    remember = request.args.get("remember")
    remember = remember == "1" if remember else False

    login_user(user, remember=False)
    identity_changed.send(current_app._get_current_object(), identity=Identity(user.id))

    return "", 200


@auth_service.route("/logout", methods=["GET"])
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

    # Remove session keys set by Flask-Principal
    for key in (
        "identity.name",
        "identity.auth_type",
        "_user_id",
        "_id",
    ):  # todo refractor function
        session.pop(key, None)

    g.pop("user", None)

    current_app.login_manager._update_request_context_with_user()

    # Tell Flask-Principal the user is anonymous
    identity_changed.send(
        current_app._get_current_object(), identity=AnonymousIdentity()
    )

    session.clear()

    return "", 200


@auth_service.route("/ping", methods=["GET"])
@login_required
def ping():
    return "pong"
