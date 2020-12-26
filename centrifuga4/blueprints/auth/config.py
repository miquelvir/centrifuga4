from functools import wraps

from flask import Blueprint, g, jsonify, request, current_app, session, abort

# initialise the blueprint
from flask_httpauth import HTTPBasicAuth
from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, \
    get_jwt_identity, unset_jwt_cookies, jwt_refresh_token_required, get_csrf_token, get_jwt_claims
from flask_login import login_user, logout_user, login_required
from flask_principal import identity_changed, Identity, AnonymousIdentity
from werkzeug.datastructures import Authorization

from centrifuga4.models import User

auth_service = Blueprint('auth', __name__)


def basic_http_auth_required(f):
    def verify_password(username: str, password: str) -> bool:
        """ Given a username and optionally a password, verify its validity. """

        print(username, password)

        user = User.query.filter_by(username=username).first()
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


@auth_service.route('/login', methods=['GET'])
@basic_http_auth_required  # require user and password to be validated
def get_auth_token():
    """
    endpoint to get a JWT for next calls


    In the before_request, the user is required to login. When reaching this endpoint, the user is already validated.
        // pre-condition: g.user has the user name
    Given a username, it generates the jwt_token and send it to the client.
    The client must store it for future calls.
    """

    print("here")

    user = g.user
    remember = request.args.get('remember')
    remember = remember == "1" if remember else False

    login_user(user, remember=remember)
    identity_changed.send(current_app._get_current_object(),
                          identity=Identity(user.id))

    return "", 200


@auth_service.route('/logout', methods=['GET'])
@login_required
# @error_handler
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
    for key in ('identity.name', 'identity.auth_type'):  # todo refractor function
        session.pop(key, None)
    # Tell Flask-Principal the user is anonymous
    identity_changed.send(current_app._get_current_object(),
                          identity=AnonymousIdentity())
    return "", 200
