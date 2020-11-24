from centrifuga4 import db

db.Table("teacher_schedule",
         db.Column("teacher_id", db.Text, db.ForeignKey('teacher.id')),
         db.Column("schedule_id", db.Text, db.ForeignKey('schedule.id')))

db.Table("student_schedule",
         db.Column("student_id", db.Text, db.ForeignKey('student.id')),
         db.Column("schedule_id", db.Text, db.ForeignKey('schedule.id')))


class Schedule(db.Model):
    __tablename__ = "schedule"

    id = db.Column(db.Integer,
                   primary_key=True)
    periodicity = db.Column(db.Text,
                            nullable=False)
    start_date_id = db.Column(db.Integer,
                              db.ForeignKey('periodic_date.id'),
                              nullable=True)
    end_date_id = db.Column(db.Integer,
                            db.ForeignKey('periodic_date.id'),
                            nullable=True)
    room_id = db.Column(db.Text,
                        db.ForeignKey('room.id'),
                        nullable=True)
    course_id = db.Column(db.Text,
                          db.ForeignKey('course.id'),
                          nullable=False)

    start_date = db.relationship("PeriodicDate",
                                 foreign_keys=[start_date_id])
    end_date = db.relationship("PeriodicDate",
                               foreign_keys=[end_date_id])
    course = db.relationship("Course",
                             foreign_keys=[course_id],
                             back_populates="schedules")
    room = db.relationship("Room",
                           foreign_keys=[room_id],
                           back_populates="schedules")
    students = db.relationship("Student",
                               secondary="student_schedule",
                               back_populates="schedules")
    teachers = db.relationship("Teacher",
                               secondary="teacher_schedule",
                               back_populates="schedules")

    def __repr__(self):
        return '<Schedule | %s - %s>' % (self.id, self.course_id)

