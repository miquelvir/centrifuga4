from flask import Blueprint

dashboard = Blueprint('dashboard', __name__)


@dashboard.route("/hi")  # todo react to subdirectory
def hi():
    return "hi"
