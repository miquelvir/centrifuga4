from dependency_injector.wiring import Provide
from server.containers import Container
from flask import jsonify
from flask_restful import Resource

from server.blueprints.pre_enrolment.services.pre_enrolment_service import (
    PreEnrolmentService,
)
from server.schemas.schemas import PublicCourseSchema


class Courses(Resource):
    def get(
        self,
        pre_enrolment_service: PreEnrolmentService = Provide[
            Container.pre_enrolment_service
        ],
    ):
        courses = pre_enrolment_service.get_published_courses()
        return jsonify(
            PublicCourseSchema(
                exclude=(
                    "price_term",
                    "is_published",
                    "rooms",
                    "teachers",
                    "students",
                    "schedules",
                    "calendar_id",
                    "attendances",
                    "calendar_url",
                )
            ).dump(courses, many=True)
        )
