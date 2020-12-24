from functools import wraps

from flask import Blueprint, g, jsonify

# initialise the blueprint
from flask_httpauth import HTTPBasicAuth
from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, \
    get_jwt_identity, unset_jwt_cookies, jwt_refresh_token_required, get_csrf_token, get_jwt_claims
from centrifuga4.models import User

auth = Blueprint('auth', __name__)

http_auth = HTTPBasicAuth()


@http_auth.verify_password
def verify_password(username: str, password: str) -> bool:
    """ Given a username and optionally a password, verify its validity. """

    g.user = User()
    return True  # todo remove

    user = User.query.filter_by(username=username).first()
    if user is None:
        return False  # user not registered

    if not user.login(password):
        return False  # password does not match

    g.user = user
    return True


@auth.route('/token', methods=['GET'])
@http_auth.login_required  # require user and password to be validated
def get_auth_token():
    """
    endpoint to get a JWT for next calls


    In the before_request, the user is required to login. When reaching this endpoint, the user is already validated.
        // pre-condition: g.user has the user name
    Given a username, it generates the jwt_token and send it to the client.
    The client must store it for future calls.
    """

    user = g.user
    claims = user.get_claims()

    # Create the tokens we will be sending back to the user
    access_token = create_access_token(identity=user.username,
                                       fresh=True,
                                       user_claims=claims)
    refresh_token = create_refresh_token(identity=user.username,
                                         user_claims=claims)

    # Set the JWTs and the CSRF double submit protection cookies
    # in this response

    resp = jsonify({
        'access_csrf': get_csrf_token(access_token),
        'refresh_csrf': get_csrf_token(refresh_token)
    })

    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)

    return resp, 200


@auth.route('/refreshedToken', methods=['GET'])
@jwt_refresh_token_required
def refresh_auth_token():
    # Create the new access token
    current_user = get_jwt_identity()

    access_token = create_access_token(identity=current_user, fresh=False, user_claims=get_jwt_claims())  # todo are claims refreshed

    # Set the access JWT and CSRF double submit protection cookies
    # in this response
    resp = jsonify({'refreshed': True})
    set_access_cookies(resp, access_token)

    return resp, 200


@auth.route('/token', methods=['DELETE'])
# @error_handler
def logout():
    """
    # Because the JWTs are stored in an httponly cookie now, we cannot
    # log the user out by simply deleting the cookie in the frontend.
    # We need the backend to send us a response to delete the cookies
    # in order to logout. unset_jwt_cookies is a helper function to
    # do just that.
    """
    resp = jsonify({'logout': True})
    unset_jwt_cookies(resp)
    return resp, 200
