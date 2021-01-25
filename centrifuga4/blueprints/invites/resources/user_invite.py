from threading import Thread

import jwt
from flask import request, current_app
from flask_restful import Resource, abort

from centrifuga4.auth_auth.action_need import InvitePermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import UsersPermission
from centrifuga4.models import User, Need
from email_queue.emails.invite_email import my_job
from email_queue.url_utils import merge_url_query_params


def generate_signup_link(_token, _email, frontend_url=None):
    return (
        merge_url_query_params(
            "%s/app/signup"
            % (
                frontend_url
                if frontend_url
                else current_app.config["FRONTEND_SERVER_URL"]
            ),
            {"token": _token, "email": _email, "lan": "cat"},
        ),
        merge_url_query_params(
            "%s/app/signup"
            % (
                frontend_url
                if frontend_url
                else current_app.config["FRONTEND_SERVER_URL"]
            ),
            {"token": _token, "email": _email, "lan": "eng"},
        ),
    )


class UserInviteCollectionRes(Resource):
    @Requires(InvitePermission, UsersPermission)
    def post(self):
        try:
            user_email = request.json["userEmail"].lower()
        except KeyError:
            return "no userEmail found", 400

        try:
            needs = request.json["needs"]
        except KeyError:
            return "no field needs found", 400

        clean_needs = []
        for need in needs:
            if Need.query.filter(Need.id == need).count() == 0:
                return "invalid need '%s' supplied" % need, 400
            clean_needs.append(need)

        if User.query.filter(User.email == user_email).count() > 0:
            return "there already exists a user with this email", 400

        token = jwt.encode(
            {"userEmail": user_email, "needs": clean_needs},
            current_app.config["INVITES_SECRET"],
            algorithm="HS256",
        )

        thread = Thread(
            target=my_job, args=(*generate_signup_link(token, user_email), user_email)
        )
        thread.start()

        return "", 200
