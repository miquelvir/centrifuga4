from flask import current_app
from flask_restful import Resource
from centrifuga4.auth_auth.action_need import EmailPermission
from centrifuga4.auth_auth.requires import Requires
from centrifuga4.auth_auth.resource_need import StudentsPermission
from centrifuga4.blueprints.api.errors import NotFound
from centrifuga4.models import Student
from email_queue.emails.enrollment_agreement_email import my_job
from centrifuga4 import q


class EnrollmentEmailCollectionRes(Resource):
    @Requires(EmailPermission, StudentsPermission)
    def post(self, student_id):
        query = Student.query.filter_by(id=student_id)
        student: Student = query.first()

        if not student:
            raise NotFound("resource with the given id not found",
                           requestedId=student_id)

        job = q.enqueue_call(
            func=my_job,
            args=(student,
                  [guardian.email for guardian in student.guardians if guardian.email]
                  + [student.email],
                  current_app.config['BACKEND_SERVER_URL']),
            result_ttl=5000
        )

        return job.get_id()


