import requests
from flask import current_app
from werkzeug.exceptions import BadRequest, InternalServerError


class RecaptchaService:
    @staticmethod
    def _post_to_recaptcha_api(response):
        return requests.post(
            current_app.config["RECAPTCHA_URL"],
            data={"secret": current_app.config["RECAPTCHA"], "response": response},
        )

    def validate(self, token) -> bool:
        """ :returns True if the recaptcha response is valid, raises an exception otherwise """

        if token is None:
            raise BadRequest("missing recaptcha token (response)")

        r = self._post_to_recaptcha_api(token)

        if not r.ok:
            raise InternalServerError("error in google siteverify api")

        if not r.json()["success"]:
            raise BadRequest("you are a robot")

        return True
