from flask_jwt_extended import jwt_required
from flask_restful import Resource
from rq.job import Job
from email_queue.worker import conn
from centrifuga4 import q


def my_job(name):
    print(name)


class WelcomeEmailRes(Resource):


    def get(self, job_id):
        print("reading")
        job = Job.fetch(job_id, connection=conn)

        if job.is_finished:
            return str(job.result), 200
        else:
            return "Nay!", 202


class WelcomeEmailCollectionRes(Resource):

    # @jwt_required
    # @needs_privileges(PRIVILEGE_ACTION_SEND_EMAILS)
    def post(self):
        print("hi nerea")
        job = q.enqueue_call(
            func=my_job, args=("nerea",), result_ttl=5000
        )
        print(job.get_id())
        return job.get_id()


