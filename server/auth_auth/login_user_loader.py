from server import login
from server.models import User


@login.user_loader
def user_loader(id_):
    """
    loads a user given its id for Flask-Login

    :param id_: the user id
    :return: the User with that id
    """
    return User.query.get(id_)
