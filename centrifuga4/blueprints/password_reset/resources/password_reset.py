import datetime

import jwt
from flask import request, current_app
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from rq.job import Job

from centrifuga4.models import User
from email_queue.password_reset_email import my_job
from email_queue.worker import conn
from centrifuga4 import q


class PasswordResetRes(Resource):  # todo mirror all redis queues
    def get(self, job_id):
        job = Job.fetch(job_id, connection=conn)

        if job.is_finished:
            return str(job.result), 200
        else:
            return "Nay!", 202

# todo, ui, before posting, checks if initial values are same


class PasswordResetCollectionRes(Resource):

    # @jwt_required
    # @needs_privileges(PRIVILEGE_ACTION_SEND_EMAILS)
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


