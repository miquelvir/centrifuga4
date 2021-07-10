import requests
from flask import current_app
from werkzeug.exceptions import BadRequest, InternalServerError


def validate_recaptcha(response):
    if not response:
        raise BadRequest("missing recaptcha token (response)")

    r = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={"secret": current_app.config["RECAPTCHA"], "response": response},
    )
    if not r.ok:
        raise InternalServerError("error in google siteverify api")

    if not r.json()["success"]:
        raise BadRequest("you are a robot")

    if r.json()["hostname"] == "localhost" and not current_app.config["DEVELOPMENT"]:
        raise BadRequest("invalid hostname localhost in production environment")
