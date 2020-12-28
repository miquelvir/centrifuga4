from centrifuga4 import login
from centrifuga4.models import User


@login.user_loader
def user_loader(id_):
    return User.query.get(id_)
