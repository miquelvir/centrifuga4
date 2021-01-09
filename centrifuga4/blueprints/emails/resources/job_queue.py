from flask_restful import Resource
from rq.job import Job

from email_queue.worker import conn


class JobQueueRes(Resource):
    def get(self, job_id):  # todo permissions etc
        job = Job.fetch(job_id, connection=conn)

        if job.is_finished:
            return str(job.result), 200
        else:
            return "Nay!", 202
