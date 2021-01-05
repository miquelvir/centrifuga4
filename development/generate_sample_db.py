import datetime

import centrifuga4
from centrifuga4.models import Student, User, Guardian, Need, Payment
from random import randint, choice


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
all_needs = (need_get, need_patch, need_delete, need_post, need_send_email, need_invite_users,
             need_students, need_courses, need_guardians, need_payments, need_rooms, need_schedules,
             need_teachers, need_users)


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


def add_students():
    for idx in range(500):
        s = Student(id=Student.generate_new_id(),
                    name="mark%s" % idx,
                    surname1="stuart%s" % idx,
                    surname2="mill%s" % idx,
                    price_term=23,
                    email="msm%s@gmail.com" % idx,
                    is_studying=choice((True, True, True, False)),
                    is_working=choice((True, False, False, False)),
                    is_enrolled=choice((True, False, False, False)),
                    is_early_unenrolled=False,
                    years_in_xamfra=randint(0, 15))

        for idx2 in range(randint(0,3)):
            g = Guardian(id=Guardian.generate_new_id(),
                         name="maria%s-%s" % (idx, idx2),
                         surname1="lópez%s-%s" % (idx, idx2),
                         surname2="suárez%s-%s" % (idx, idx2),
                         email="mls%s_%s@gmail.com" % (idx, idx2),
                        relation=choice(("mother", "father", "grandmother", "grandfather", "tutor")),
                         is_working=choice((True, True, True, False)),
                         is_studying=choice((True, False, False, False))
                         )
            s.guardians.append(g)
            centrifuga4.db.session.add(g)

        for idx2 in range(randint(0, 3)):
            p = Payment(id=Payment.generate_new_id(),
                        quantity=randint(0, 150),
                        method=choice(('cash', 'bank-transfer')),
                        date=datetime.date(randint(2019, 2020), randint(1, 12), randint(1, 28)),
                        concept=choice(("violin payment", "new payment", "recurring payment", "love ya")))
            s.payments.append(p)

        centrifuga4.db.session.add(s)


if __name__ == "__main__":
    app = centrifuga4.init_app("config.DevelopmentConfig")
    with app.app_context():
        centrifuga4.db.drop_all()  # drop previous schemas
        centrifuga4.db.create_all()  # load new schemas

        add_needs()
        add_users()
        add_students()

        centrifuga4.db.session.commit()

