from typing import Optional, List

import marshmallow
from werkzeug.exceptions import BadRequest

from server import db
from server.models import Course, Student, Guardian
from server.models.student import EnrolmentStatus
from server.schemas.schemas import StudentSchema, GuardianSchema
from server.signals import student_pre_enrolled


class PreEnrolmentService:
    @staticmethod
    def get_published_courses() -> List[Course]:
        return Course.query.filter(Course.is_published == True).all()

    @staticmethod
    def _generate_new_student_id():
        return Student.generate_new_id()

    @staticmethod
    def _generate_new_guardian_id():
        return Guardian.generate_new_id()

    @staticmethod
    def _get_course(id_: str) -> Optional[Course]:
        return Course.query.filter(Course.id == id_).one_or_none()

    def parse_student(self, body: Optional[dict]) -> Student:
        if body is None:
            raise BadRequest("no body found")

        # prepare a dict to load the student
        student_body = {**body}
        del student_body["guardians"]  # these will be loaded independently
        del student_body["courses"]  # these will be loaded independently
        student_body["id"] = self._generate_new_student_id()
        student_body["enrolment_status"] = EnrolmentStatus.pre_enrolled

        try:  # we use transient since we don't want to attempt to load the student from the db
            student: Student = StudentSchema(transient=True).load(student_body)
        except marshmallow.exceptions.ValidationError as e:
            raise BadRequest(str(e))

        # load courses
        courses = body.get("courses", [])
        for course_id in courses:
            c = self._get_course(course_id)
            if not c:
                raise BadRequest(f"no course found with id {course_id!r}")
            if not c.is_published:
                raise BadRequest(f"course {course_id!r} is not public")
            student.courses.append(c)

        # load guardians
        guardians = body.get("guardians", [])
        for guardian_body in guardians:
            guardian_body["id"] = self._generate_new_guardian_id()

            try:
                guardian: Guardian = GuardianSchema().load(guardian_body)
            except marshmallow.exceptions.ValidationError as e:
                raise BadRequest(str(e))

            student.guardians.append(guardian)
        return student

    # unittest:none
    def trigger_event_student_pre_enrolled(self, student: Student):
        student_pre_enrolled.send(self, student=student)

    @staticmethod
    def save_student(student: Student):
        db.session.add(student)
        db.session.commit()

