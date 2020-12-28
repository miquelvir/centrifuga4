from flask_login import current_user


def on_identity_loaded(sender, identity):
    # Set the identity user object
    identity.user = current_user
    if hasattr(current_user, 'needs'):
        for need in current_user.needs:
            identity.provides.add(need.need)  # gets the need object instead of the key
    else:
        print("nope")
    print("x", identity.provides)
