from sqlalchemy.ext.hybrid import hybrid_property

from server import db
from server.models._base import MyBase


class Attendance(MyBase):
    __tablename__ = "attendance"

    STATUS_ATTENDED = 0
    STATUS_ATTENDED_TEXT = "attended"

    STATUS_ABSENT = 1
    STATUS_ABSENT_TEXT = "absent"

    STATUS_ABSENT_JUSTIFIED = 2
    STATUS_ABSENT_JUSTIFIED_TEXT = "absent-justified"

    STATUS_INT_TO_TEXT = {
        STATUS_ATTENDED: STATUS_ATTENDED_TEXT,
        STATUS_ABSENT: STATUS_ABSENT_TEXT,
        STATUS_ABSENT_JUSTIFIED: STATUS_ABSENT_JUSTIFIED_TEXT,
    }

    id = db.Column(db.String, primary_key=True)  # todo maybe not store as string
    date = db.Column(db.Date, nullable=False)
    course_id = db.Column(db.Text, db.ForeignKey("course.id"), nullable=False)
    student_id = db.Column(db.Text, db.ForeignKey("student.id"), nullable=False)

    status = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    student = db.relationship(
        "Student", foreign_keys=student_id, back_populates="attendances"
    )
    course = db.relationship(
        "Course", foreign_keys=course_id, back_populates="attendances"
    )

    __table_args__ = (db.UniqueConstraint(date, course_id, student_id),)

    def __repr__(self):
        return "<Attendance | %s - %s>" % (self.student_id, self.course_id)

    @hybrid_property
    def text_status(self):
        return self.STATUS_INT_TO_TEXT.get(self.status, None)
