from server import db
from server.auth_auth.new_needs import AttendanceNeed
from server.models._base import MyBase


class Attendance(MyBase):
    __tablename__ = "attendance"

    permissions = {AttendanceNeed}

    date = db.Column(db.Date, nullable=False)
    course_id = db.Column(db.Text, db.ForeignKey("course.id"), nullable=False)
    student_id = db.Column(db.Text, db.ForeignKey("student.id"), nullable=False)

    student = db.relationship(
        "Student", foreign_keys=student_id, back_populates="attendances"
    )
    course = db.relationship(
        "Course", foreign_keys=course_id, back_populates="attendances"
    )

    __table_args__ = (db.PrimaryKeyConstraint(date, course_id, student_id),)

    def __repr__(self):
        return "<Attendance | %s - %s>" % (self.student_id, self.course_id)
