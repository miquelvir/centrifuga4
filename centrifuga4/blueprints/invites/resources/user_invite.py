import datetime

import jwt
from flask import request, current_app
from flask_jwt_extended import jwt_required
from flask_restful import Resource, abort
from rq.job import Job

from centrifuga4.models import User
from email_queue.invite_email import my_job
from email_queue.worker import conn
from centrifuga4 import q


class UserInviteRes(Resource):
    def get(self, job_id):
        job = Job.fetch(job_id, connection=conn)

        if job.is_finished:
            return str(job.result), 200
        else:
            return "Nay!", 202

# todo, ui, before posting, checks if initial values are same


class UserInviteCollectionRes(Resource):

    # @jwt_required
    # @needs_privileges(PRIVILEGE_ACTION_SEND_EMAILS)
    def post(self):
        try:
            user_email = request.json["userEmail"]
        except KeyError:
            abort(400, "no user email found in body")
        print("new user invite", user_email)

        if User.query.filter_by(username=user_email).count() > 0:
            abort(400, "user already exists")

        token = jwt.encode({'userEmail': user_email,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
                   current_app.secret_key,
                   algorithm='HS256')

        job = q.enqueue_call(
            func=my_job, args=(token, user_email, ), result_ttl=5000
        )

        return job.get_id()


