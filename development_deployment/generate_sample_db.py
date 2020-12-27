from flask import current_app, request
from flask_principal import Permission, RoleNeed
import centrifuga4
from centrifuga4.models import Student, User, Guardian
from random import randint, choice

def add_users():
    for idx in range(20):
        u = User(id=User.generate_new_id(),
                    name="john%s" % idx,
                    surname1="marques%s" % idx,
                    surname2="brownlee%s" % idx,
                    email="jmb%s@gmail.com" % idx,
                    username="jmb%s@gmail.com" % idx)
        centrifuga4.db.session.add(u)

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
    centrifuga4.db.drop_all()  # drop previous schemas
    centrifuga4.db.create_all()  # load new schemas

    add_users()
    add_students()

    centrifuga4.db.session.commit()

