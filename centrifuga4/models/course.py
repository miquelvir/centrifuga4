from centrifuga4 import db

db.Table("teacher_course",
         db.Column("teacher_id", db.Text, db.ForeignKey('teacher.id')),
         db.Column("course_id", db.Text, db.ForeignKey('course.id')))


db.Table("student_course",
         db.Column("student_id", db.Text, db.ForeignKey('student.id')),
         db.Column("course_id", db.Text, db.ForeignKey('course.id')))


db.Table("room_course",
         db.Column("room_id", db.Text, db.ForeignKey('room.id')),
         db.Column("course_id", db.Text, db.ForeignKey('course.id')))


class Course(db.Model):
    __tablename__ = "course"
    __mapper_args__ = {
        'polymorphic_identity': "course"
    }

    id = db.Column(db.Text,
                   primary_key=True)
    name = db.Column(db.Text,
                     nullable=False)

    rooms = db.relationship("Room",
                            secondary="room_course",
                            back_populates="courses")
    teachers = db.relationship("Teacher",
                               secondary="teacher_course",
                               back_populates="courses")
    students = db.relationship("Student",
                               secondary="student_course",
                               back_populates="courses")
    schedules = db.relationship("Schedule",
                                back_populates="course")

    def __repr__(self):
        return '<Course | %s - %s>' % (self.id, self.name)

