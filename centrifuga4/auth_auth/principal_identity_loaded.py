from flask_login import current_user
import logging as log


def on_identity_loaded(_, identity):
    """
    loads the current user as identity

    loads the current Flask-Principal identity from flask_login and adds the needs

    :param _: sender
    :param identity: the identity object
    :return: None
    """
    # Set the identity user object
    identity.user = current_user

    # add the needs that the user provides to the identity
    if hasattr(current_user, 'needs'):  # needed since identity could be Anonymous
        log.info("loaded user with needs: %s" % current_user.needs)
        for need in current_user.needs:
            identity.provides.add(need.need)  # gets the need object instead of the key

