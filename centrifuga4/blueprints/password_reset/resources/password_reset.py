import datetime

import jwt
from flask import request, current_app
from flask_restful import Resource, abort

from centrifuga4.models import User
from email_queue.emails.password_reset_email import my_job

from centrifuga4 import q
from email_queue.url_utils import merge_url_query_params


class PasswordResetCollectionRes(Resource):
    def post(self):
        try:
            username = request.json["username"]
        except KeyError:
            abort(400, "no username found in body")

        user = User.query.filter_by(username=username).one_or_none()
        if user is None:
            return 200

        token = jwt.encode({'username': user.username,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=30)},
                   current_app.secret_key + user.password_hash,
                   algorithm='HS256')

        def generate_password_reset_link(_token, _username):
            return merge_url_query_params(
                "%s/password-reset" % current_app.config["FRONTEND_SERVER_URL"],
                {"token": _token, "username": _username, "lan": "cat"}), merge_url_query_params(
                "%s/password-reset" % current_app.config["FRONTEND_SERVER_URL"],
                {"token": _token, "username": _username, "lan": "eng"})

        job = q.enqueue_call(
            func=my_job, args=(*generate_password_reset_link(token, username), user.email, ), result_ttl=5000
        )

        return job.get_id()
