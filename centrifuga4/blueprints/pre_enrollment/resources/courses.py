import datetime
from threading import Thread

import jwt
from flask import request, current_app, jsonify
from flask_restful import Resource, abort

from centrifuga4.models import User, Course
from centrifuga4.schemas.schemas import PublicCourseSchema
from email_queue.emails.password_reset_email import my_job

from email_queue.url_utils import merge_url_query_params


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
                )
            ).dump(courses, many=True)
        )  # todo pagination
