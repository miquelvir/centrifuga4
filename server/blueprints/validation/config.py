import jwt
from flask import Blueprint, current_app, render_template

validation_blueprint = Blueprint("validation", __name__, template_folder="templates")


@validation_blueprint.route("/<token>")
def validation(token: str):
    try:
        data = jwt.decode(
            bytes(token, encoding="utf-8"),
            current_app.config["PUBLIC_VALIDATION_SECRET"],
            algorithms=["HS256"],
        )
        return render_template("valid_document.html", data=data)
    except Exception as e:
        return render_template("invalid_document.html")
