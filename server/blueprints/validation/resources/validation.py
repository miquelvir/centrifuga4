import jwt
from dependency_injector.wiring import Provide
from server.containers import Container
from flask import render_template
from flask_restful import Resource
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from server.services.jwt_service import JwtService


class Validation(Resource):
    def get(
        self, token: str, jwt_service: "JwtService" = Provide[Container.jwt_service]
    ):
        is_valid, data = jwt_service.is_valid(token)
        if is_valid:
            return render_template("valid_document.html", data=data)
        return render_template("invalid_document.html")
