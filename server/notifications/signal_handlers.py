from threading import Thread

from server.models import Student
from server.signals import student_pre_enrolled

from server.emails.emails.pre_enrolment_email import my_job  # todo rename


def when_student_enrolled(_, student: Student):
    thread = Thread(target=my_job, args=(student.official_notification_emails, student.id))
    thread.start()


def add_subscribers():
    student_pre_enrolled.connect(when_student_enrolled)

