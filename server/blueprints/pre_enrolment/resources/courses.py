from flask import jsonify
from flask_restful import Resource

from server.models import Course
from server.schemas.schemas import PublicCourseSchema


class Courses(Resource):
    def get(self):
        courses = Course.query.filter(Course.is_published == True).all()
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
                    "calendar_url",
                )
            ).dump(courses, many=True)
        )
