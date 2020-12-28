import datetime

import jwt
from flask import request, current_app
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from rq.job import Job

from centrifuga4.models import User
from email_queue.password_reset_email import my_job

from centrifuga4 import q


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

        job = q.enqueue_call(
            func=my_job, args=(token, user.email, user.username, ), result_ttl=5000
        )

        return job.get_id()
