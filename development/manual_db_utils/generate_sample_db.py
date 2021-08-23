from os.path import join, dirname
from dotenv import load_dotenv

import datetime
from typing import List

import server
from server.models import (
    Student,
    User,
    Guardian,
    Payment,
    Course,
    Teacher,
    Label,
    Room,
    Schedule,
    Role,
)
from random import randint, choice, sample

role_administrator = Role(
    id=Role.ADMINISTRATOR,
    description="administrative which can manage users",
    name=Role.ADMINISTRATOR,
)
role_administrative = Role(
    id=Role.ADMINISTRATIVE,
    description="layman which can modify resources and create payment receipts",
    name=Role.ADMINISTRATIVE,
)
role_teacher = Role(
    id=Role.TEACHER,
    description="can mark attendance on his classes and access its courses & students",
    name=Role.TEACHER,
)
role_layman = Role(
    id=Role.LAYMAN, description="can read most resources", name=Role.LAYMAN
)
role_empty = Role(
    id=Role.EMPTY, description="does not have special permissions", name=Role.EMPTY
)

all_roles = (
    role_teacher,
    role_administrative,
    role_administrator,
    role_empty,
    role_layman,
)


def add_roles():
    for role in all_roles:
        server.db.session.add(role)


def add_users(teachers):
    for idx in range(20):
        print("    user %s" % idx)
        u = User(
            id=User.generate_new_id(),
            name="john%s" % idx,
            surname1="marques%s" % idx,
            surname2="brownlee%s" % idx,
            email="jmb%s@gmail.com" % idx,
            password_hash=User.hash_password("john%s" % idx),
        )
        server.db.session.add(u)

    admin = User(
        id=User.generate_new_id(),
        name="admin",
        surname1="admin",
        surname2="admin",
        email="admin@gmail.com",
        password_hash=User.hash_password("admin"),
    )

    admin.role = role_administrator
    server.db.session.add(admin)
    teacher = User(
        id=User.generate_new_id(),
        name="teacher",
        surname1="teacher",
        surname2="teacher",
        email="teacher@gmail.com",
        password_hash=User.hash_password("teacher"),
        teacher=teachers[0],
    )

    teacher.role = role_teacher

    server.db.session.add(teacher)


def add_teachers():
    teachers = []
    for idx in range(20):
        print("    teacher %s" % idx)
        t = Teacher(
            id=Teacher.generate_new_id(),
            name="ester%s" % idx,
            surname1="bonal%s" % idx,
            surname2="vivé%s" % idx,
            calendar_id=Teacher.generate_new_id(),
            email="ebv%s@gmail.com" % idx,
        )
        server.db.session.add(t)
        teachers.append(t)
    return teachers


def add_rooms():
    rooms = []
    for idx in range(20):
        print("    room %s" % idx)
        r = Room(
            id=Room.generate_new_id(), name="monpou %s" % idx, capacity=randint(1, 50)
        )
        server.db.session.add(r)
        rooms.append(r)
    return rooms


def generate_schedule(course_id):
    start_h = randint(0, 21)
    start_m = choice((0, 15, 30, 45))
    return Schedule(
        id=Schedule.generate_new_id(),
        day_week=randint(0, 6),
        start_time=datetime.time(start_h, start_m),
        end_time=datetime.time(randint(start_h + 1, 23), start_m),
        course_id=course_id,
    )


def add_courses(
    students: List[Student],
    teachers: List[Teacher],
    labels: List[Label],
    rooms: List[Room],
):
    for idx in range(100):
        print("    course %s" % idx)
        course_id = Course.generate_new_id()
        c = Course(
            id=course_id,
            name="course %s" % idx,
            description=choice(("course description %s" % idx, None)),
            is_published=choice((True, True, True, True, False)),
            calendar_id=Course.generate_new_id(),
        )

        for student in sample(students, randint(0, 50)):
            c.students.append(student)
            if choice((True, False, False)):
                s = generate_schedule(course_id)
                s.student_id = student.id
                server.db.session.add(s)

        for teacher in sample(teachers, randint(0, 4)):
            c.teachers.append(teacher)

        for label in sample(labels, randint(0, 10)):
            c.labels.append(label)

        if choice((True, False, False)):
            c.rooms.append(choice(rooms))

        for idx2 in range(randint(0, 3)):
            c.schedules.append(generate_schedule(course_id))

        server.db.session.add(c)


def generate_student(idx):
    return Student(
        id=Student.generate_new_id(),
        name="mark%s" % idx,
        surname1="stuart%s" % idx,
        surname2="mill%s" % idx,
        price_term=randint(0, 300),
        email="msm%s@gmail.com" % idx,
        birth_date=datetime.date(randint(1970, 2019), randint(1, 12), randint(1, 28)),
        is_studying=choice((True, True, True, False)),
        is_working=choice((True, False, False, False)),
        enrolment_status=choice(("enrolled", "early-unenrolled", "pre-enrolled")),
        years_in_xamfra=randint(0, 15),
        image_agreement=choice((True, False)),
    )


def add_students(amount=500):
    students = []
    for idx in range(amount):
        print("    student %s" % idx)
        s = generate_student(idx)

        for idx2 in range(randint(0, 3)):
            g = Guardian(
                id=Guardian.generate_new_id(),
                name="maria%s-%s" % (idx, idx2),
                surname1="lópez%s-%s" % (idx, idx2),
                surname2="suárez%s-%s" % (idx, idx2),
                email="mls%s_%s@gmail.com" % (idx, idx2),
                relation=choice(
                    ("mother", "father", "grandmother", "grandfather", "legal_guardian")
                ),
                is_working=choice((True, True, True, False)),
                is_studying=choice((True, False, False, False)),
            )
            s.guardians.append(g)
            server.db.session.add(g)

        for idx2 in range(randint(0, 3)):
            p = Payment(
                id=Payment.generate_new_id(),
                quantity=randint(0, 150),
                method=choice(("cash", "bank-transfer", "bank-direct-debit")),
                date=datetime.date(randint(2019, 2020), randint(1, 12), randint(1, 28)),
                concept=choice(
                    ("violin payment", "new payment", "recurring payment", "love ya")
                ),
            )
            s.payments.append(p)

        server.db.session.add(s)
        students.append(s)
    return students


def add_labels():
    labels = []
    for label_name in (
        "kindergarten_p1",
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
        "other",
        "adult",
    ):
        l = Label(id=label_name)
        server.db.session.add(l)
        labels.append(l)
    return labels


def add_all():
    print("dropping... [1]")
    server.db.drop_all()  # drop previous schemas
    print("creating... [2]")
    server.db.create_all()  # load new schemas
    print("adding roles... [3]")
    add_roles()
    print("adding users... [4]")
    teachers = add_teachers()
    add_users(teachers)
    print("adding students... [5]")
    students = add_students()
    print("adding teachers... [6]")

    print("adding labels... [7]")
    labels = add_labels()
    print("adding rooms... [8]")
    rooms = add_rooms()
    print("adding courses... [9]")
    add_courses(students, teachers, labels, rooms)
    print("commiting... [10]")
    server.db.session.commit()


if __name__ == "__main__":
    app = server.init_app("config.DevelopmentConfig")
    with app.app_context():
        add_all()
