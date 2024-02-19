from dependency_injector.wiring import inject, Provide
from flask import request
from flask_restful import Resource
from werkzeug.exceptions import BadRequest, InternalServerError
from server.blueprints.pre_enrolment.services.pre_enrolment_service import (
    PreEnrolmentService,
)
from server.services.recaptcha_service import RecaptchaService
from server.containers import Container
from server.services.audit_service import audit_log_info, audit_log_warn


class PreEnrollment(Resource):
    @inject
    def post(
        self,
        recaptcha_service: RecaptchaService = Provide[Container.recaptcha_service],
        pre_enrolment_service: PreEnrolmentService = Provide[
            Container.pre_enrolment_service
        ],
    ):
        if request.json is None:
            audit_log_warn(f"Pre-enrolment failed (no body)")
            raise BadRequest("no json found")

        # validate recaptcha passes
        recaptcha = request.json.get("recaptcha", None)
        try:
            recaptcha_service.validate(recaptcha)
        except (BadRequest, InternalServerError):
            audit_log_warn(f"Pre-enrolment failed (invalid recaptcha)")
            raise

        # if recaptcha is valid, then try to parse a new student
        body = request.json.get("body", None)
        try:
            student = pre_enrolment_service.parse_student(body)
        except BadRequest:
            audit_log_warn(f"Pre-enrolment failed (could not parse student)")
            raise

        # save the new student to the db
        pre_enrolment_service.save_student(student)
        audit_log_info(f"Pre-enrolment successful")

        # signal new student added
        pre_enrolment_service.trigger_event_student_pre_enrolled(student)
