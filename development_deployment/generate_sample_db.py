from flask import current_app, request
from flask_principal import Permission, RoleNeed
import centrifuga4
from centrifuga4.models import Student, User, Guardian, Need
from random import randint, choice


n1 = Need(id=0, name="get", description="can perform get operations", type="action")
n2 = Need(id=1, name="students", description="can use student resources", type="res")


def add_needs():
    centrifuga4.db.session.add(n1)
    centrifuga4.db.session.add(n2)


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

    admin.needs.append(n1)
    admin.needs.append(n2)
    centrifuga4.db.session.add(admin)


def add_students():
    for idx in range(500):
        s = Student(id=Student.generate_new_id(),
                    name="mark%s" % idx,
                    surname1="stuart%s" % idx,
                    surname2="mill%s" % idx,
                    price_term=23,
                    email="msm%s@gmail.com" % idx)

        for idx2 in range(randint(0,3)):
            g = Guardian(id=Guardian.generate_new_id(),
                         name="maria%s-%s" % (idx, idx2),
                         surname1="lópez%s-%s" % (idx, idx2),
                         surname2="suárez%s-%s" % (idx, idx2),
                         email="mls%s_%sgmail.com" % (idx, idx2),
                        relation=choice(("mother", "father", "grandmother", "grandfather", "tutor")))
            s.guardians.append(g)
            centrifuga4.db.session.add(g)

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

