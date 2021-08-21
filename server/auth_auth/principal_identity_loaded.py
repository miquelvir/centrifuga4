from flask_login import current_user


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
    return  # todo can be removed as well as principal dependency
    # add the needs that the user provides to the identity
    if hasattr(current_user, "needs"):  # needed since identity could be Anonymous
        for need in current_user.needs:
            identity.provides.add(need.need)  # gets the need object instead of the key

    if hasattr(current_user, "role"):
        current_user.role.load_needs_to_identity()
