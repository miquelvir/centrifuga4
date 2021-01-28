import datetime

import icalendar as icalendar
import jwt
from flask import request, current_app
from flask_restful import Resource

from centrifuga4.constants import SHORT_NAME
from centrifuga4.file_utils.string_bytes_io import make_response_with_file
from centrifuga4.models import Course, Schedule, Student, Teacher


class CalendarRes(Resource):
    def get(self, res, course_id, calendar_id):
        if not (res == "courses" or res == "teachers"):
            return "no calendars available for '%s'" % res, 404

        if res == "courses":
            course = Course.query.filter(Course.id == course_id).one_or_none()
        elif res == "teachers":
            course = Teacher.query.filter(Teacher.id == course_id).one_or_none()

        if course is None:
            return "no resource found with id '%s'" % course_id, 404

        if calendar_id != course.calendar_id:
            return "no calendar found with id '%s'" % calendar_id, 404

        filename = "calendar-%s.ics" % course.id

        cal = icalendar.Calendar()
        cal.add("prodid", "-//Tester//Version 0.1.1//EN")
        cal.add("version", "2.0")
        cal.add("tzid", "Europe/Madrid")
        cal.add("x-wr-timezone", "Europe/Madrid")

        for s in course.schedules:
            first_day = datetime.datetime.now()
            while int(first_day.strftime("%w")) != s.day_week:
                first_day += datetime.timedelta(days=1)

            s: Schedule
            event = icalendar.Event()
            event.add("uid", SHORT_NAME + "-" + s.id)
            event.add("tzid", "Europe/Madrid")
            event.add(
                "dtstart",
                first_day.replace(
                    hour=s.start_time.hour,
                    second=s.start_time.second,
                    minute=s.start_time.minute,
                ),
            )
            event.add(
                "dtend",
                first_day.replace(
                    hour=s.end_time.hour,
                    second=s.end_time.second,
                    minute=s.end_time.minute,
                ),
            )
            event.add("rrule", {"freq": "weekly"})
            event.add("location", [r.name for r in s.course.rooms])
            if s.day_week == 0:
                event.add("byday", ["SU"])
            if s.day_week == 1:
                event.add("byday", ["MO"])
            if s.day_week == 2:
                event.add("byday", ["TU"])
            if s.day_week == 3:
                event.add("byday", ["WE"])
            if s.day_week == 4:
                event.add("byday", ["TH"])
            if s.day_week == 5:
                event.add("byday", ["FR"])
            if s.day_week == 6:
                event.add("byday", ["SA"])

            if s.is_base:
                event.add(
                    "description",
                    "%s\n\ncourse id: %s" % (s.course.description, s.course.id),
                )
                event.add("summary", s.course.name)
                event.add("color", "purple")
            else:
                event.add(
                    "description",
                    "%s\n\ncourse id: %s\nstudent id: %s\nstudent: %s"
                    % (
                        s.course.description,
                        s.course.id,
                        s.student_id,
                        Student.query.filter(Student.id == s.student_id)
                        .first()
                        .full_name,
                    ),
                )
                event.add("color", "orange")
                event.add(
                    "summary",
                    "%s - %s"
                    % (
                        s.course.name,
                        Student.query.filter(Student.id == s.student_id)
                        .first()
                        .full_name,
                    ),
                )

            cal.add_component(event)

        stream = cal.to_ical()

        return make_response_with_file(stream, filename, "text/calendar")
