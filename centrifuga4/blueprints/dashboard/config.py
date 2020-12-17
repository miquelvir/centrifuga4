from flask import Blueprint

dashboard = Blueprint('dashboard', __name__)


@dashboard.route("/hi")
def hi():
    return "hi"
