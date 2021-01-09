import datetime
from typing import List

import centrifuga4
from centrifuga4.models import Student, User, Guardian, Need, Payment, Course, Teacher, Label, Room, Schedule
from random import randint, choice, sample

from centrifuga4.models.raw_person import RawPerson

need_get = Need(id=0, name="get", description="can perform get operations", type="action")
need_patch = Need(id=1, name="patch", description="can perform patch operations", type="action")
need_delete = Need(id=2, name="delete", description="can perform delete operations", type="action")
need_post = Need(id=3, name="post", description="can perform post operations", type="action")
need_send_email = Need(id=4, name="send_email", description="can send emails", type="action")
need_invite_users = Need(id=5, name="invite_users", description="can invite users", type="action")
need_students = Need(id=6, name="students", description="can use students resource", type="res")
need_courses = Need(id=7, name="courses", description="can use courses resource", type="res")
need_guardians = Need(id=8, name="guardians", description="can use guardians resource", type="res")
need_payments = Need(id=9, name="payments", description="can use payments resource", type="res")
need_rooms = Need(id=10, name="rooms", description="can use rooms resource", type="res")
need_schedules = Need(id=11, name="schedules", description="can use schedules resource", type="res")
need_teachers = Need(id=12, name="teachers", description="can use teachers resource", type="res")
need_users = Need(id=13, name="users", description="can use users resource", type="res")
need_recipes = Need(id=14, name="payments-recipes", description="can use the recipes of payments", type="res")
all_needs = (need_get, need_patch, need_delete, need_post, need_send_email, need_invite_users,
             need_students, need_courses, need_guardians, need_payments, need_rooms, need_schedules,
             need_teachers, need_users, need_recipes)


def add_needs():
    for need in all_needs:
        centrifuga4.db.session.add(need)


def add_users():
    for idx in range(20):
        u = User(id=User.generate_new_id(),
                 name="john%s" % idx,
                 surname1="marques%s" % idx,
                 surname2="brownlee%s" % idx,
                 email="jmb%s@gmail.com" % idx,
                 username="jmb%s@gmail.com" % idx,
                 password_hash=User.hash_password("john%s" % idx))
        centrifuga4.db.session.add(u)

    admin = User(id=User.generate_new_id(),
                 name="admin",
                 surname1="admin",
                 surname2="admin",
                 email="admin@gmail.com",
                 username="admin@gmail.com",
                 password_hash=User.hash_password("admin"))

    for need in all_needs:
        admin.needs.append(need)

    centrifuga4.db.session.add(admin)


def add_teachers():
    teachers = []
    for idx in range(20):
        t = Teacher(id=RawPerson.generate_new_id(),  # todo id collision check
                    name="ester%s" % idx,
                    surname1="bonal%s" % idx,
                    surname2="vivé%s" % idx,
                    email="ebv%s@gmail.com" % idx)
        centrifuga4.db.session.add(t)
        teachers.append(t)
    return teachers


def add_rooms():
    rooms = []
    for idx in range(20):
        r = Room(id=Room.generate_new_id(),  # todo id collision check
                 name="ester%s" % idx,
                 capacity=randint(1, 50))
        centrifuga4.db.session.add(r)
        rooms.append(r)
    return rooms


def add_courses(students: List[Student], teachers: List[Teacher], labels: List[Label], rooms: List[Room]):
    for idx in range(100):
        course_id = Course.generate_new_id()
        c = Course(id=course_id,
                   name="course %s" % idx,
                   description=choice(("course description %s" % idx, None)))

        for student in sample(students, randint(0, 50)):
            c.students.append(student)

        for teacher in sample(teachers, randint(0, 4)):
            c.teachers.append(teacher)

        for label in sample(labels, randint(0, 10)):
            c.labels.append(label)

        c.rooms.append(choice(rooms))

        for idx2 in range(randint(1, 3)):
            c.schedules.append(Schedule(Schedule.generate_new_id(),
                                        choice(('weekly', 'yearly', 'monthly', 'daily')),
                                        None,
                                        None,
                                        choice(rooms).id,
                                        course_id))

        centrifuga4.db.session.add(c)


def add_students():
    students = []
    for idx in range(500):
        s = Student(id=RawPerson.generate_new_id(),
                    name="mark%s" % idx,
                    surname1="stuart%s" % idx,
                    surname2="mill%s" % idx,
                    price_term=23,
                    email="msm%s@gmail.com" % idx,
                    is_studying=choice((True, True, True, False)),
                    is_working=choice((True, False, False, False)),
                    enrollment_status=choice(('enrolled', 'early-unenrolled', 'pre-enrolled')),
                    years_in_xamfra=randint(0, 15),
                    image_agreement=choice((True, False)))

        for idx2 in range(randint(0, 3)):
            g = Guardian(id=RawPerson.generate_new_id(),
                         name="maria%s-%s" % (idx, idx2),
                         surname1="lópez%s-%s" % (idx, idx2),
                         surname2="suárez%s-%s" % (idx, idx2),
                         email="mls%s_%s@gmail.com" % (idx, idx2),
                         relation=choice(("mother", "father", "grandmother", "grandfather", "legal_guardian")),
                         is_working=choice((True, True, True, False)),
                         is_studying=choice((True, False, False, False))
                         )
            s.guardians.append(g)
            centrifuga4.db.session.add(g)

        for idx2 in range(randint(0, 3)):
            p = Payment(id=Payment.generate_new_id(),
                        quantity=randint(0, 150),
                        method=choice(('cash', 'bank-transfer', 'bank-direct-debit')),
                        date=datetime.date(randint(2019, 2020), randint(1, 12), randint(1, 28)),
                        concept=choice(("violin payment", "new payment", "recurring payment", "love ya")))
            s.payments.append(p)

        centrifuga4.db.session.add(s)
        students.append(s)
    return students


def add_labels():
    labels = []
    for label_name in ("kindergarten_p1",
                       "kindergarten_p2",
                       "kindergarten_p3",
                       "kindergarten_p4",
                       "kindergarten_p5",
                       "primary_1",
                       "primary_2",
                       "primary_3",
                       "primary_4",
                       "primary_5",
                       "primary_6",
                       "eso_1",
                       "eso_2",
                       "eso_3",
                       "eso_4",
                       "baccalaureate_1",
                       "baccalaureate_2",
                       "FP_lower",
                       "FP_higher",
                       "undergraduate",
                       "master",
                       "phd",
                       "other"):
        l = Label(name=label_name)
        centrifuga4.db.session.add(l)
        labels.append(l)
    return labels


if __name__ == "__main__":
    app = centrifuga4.init_app("config.DevelopmentConfig")
    with app.app_context():
        centrifuga4.db.drop_all()  # drop previous schemas
        centrifuga4.db.create_all()  # load new schemas

        add_needs()
        add_users()
        students = add_students()
        teachers = add_teachers()
        labels = add_labels()
        rooms = add_rooms()
        add_courses(students, teachers, labels, rooms)

        centrifuga4.db.session.commit()
