from flask_principal import Permission, RoleNeed

import centrifuga4
from centrifuga4.models import Person, Student, User

app = centrifuga4.init_app("config.DevelopmentConfig")

admin_permission = Permission(RoleNeed('admin'))

@app.route("/hi")
@admin_permission.require()
def _hi():
    return "hiiiiiiiiii"


if __name__ == "__main__":
    with app.app_context():
        # centrifuga4.db.drop_all()
        # centrifuga4.db.create_all()
        """s5 = Student(id="john5", name="john0", price_term=23, email="john0@gmail.com")
        s6 = Student(id="john6", name="john1", price_term=23, email="john1@gmail.com")
        s7 = Student(id="john7", name="john2", price_term=23, email="john2@gmail.com")
        s8 = Student(id="john8", name="john3", price_term=23, email="john3@gmail.com")
        s9 = Student(id="john9", name="john4", price_term=23, email="john4@gmail.com")
        s10 = Student(id="john10", name="john10", price_term=23, email="john0@gmail.com")
        s11 = Student(id="john11", name="john11", price_term=23, email="john1@gmail.com")
        s12 = Student(id="john12", name="john12", price_term=23, email="john2@gmail.com")
        s13 = Student(id="john13", name="john13", price_term=23, email="john3@gmail.com")
        s14 = Student(id="john14", name="john14", price_term=23, email="john4@gmail.com")
        s15 = Student(id="john15", name="john15", price_term=23, email="john0@gmail.com")
        s16 = Student(id="john16", name="john16", price_term=23, email="john1@gmail.com")
        s17 = Student(id="john17", name="john17", price_term=23, email="john2@gmail.com")
        s18 = Student(id="john18", name="john18", price_term=23, email="john3@gmail.com")
        s19 = Student(id="john19", name="john19", price_term=23, email="john4@gmail.com")
        s20 = Student(id="john20", name="john20", price_term=23, email="john3@gmail.com")
        s21 = Student(id="john21", name="john21", price_term=23, email="john4@gmail.com")
        s22 = Student(id="john22", name="john22", price_term=23, email="john3@gmail.com")
        s23 = Student(id="john23", name="john23", price_term=23, email="john4@gmail.com")"""
        # s.guardians.append(Guardian(id="ua81-john", name="ua81-john", relation="mother"))
        """u = User(id="admin", name="admin",
                username="admin", password_hash=User.hash_password("admin"),
             privilege_read=True)"""
        # g = Guardian(id="g", name="guard")"""
        # u = User(id="admin", name="admin", username="admin", password_hash=pwd_context.hash("admin"))

        """centrifuga4.db.session.add(s5)
        centrifuga4.db.session.add(s6)
        centrifuga4.db.session.add(s7)
        centrifuga4.db.session.add(s8)
        centrifuga4.db.session.add(s9)
        centrifuga4.db.session.add(s10)
        centrifuga4.db.session.add(s11)
        centrifuga4.db.session.add(s12)
        centrifuga4.db.session.add(s13)
        centrifuga4.db.session.add(s14)
        centrifuga4.db.session.add(s15)
        centrifuga4.db.session.add(s16)
        centrifuga4.db.session.add(s17)
        centrifuga4.db.session.add(s18)
        centrifuga4.db.session.add(s19)
        centrifuga4.db.session.add(s20)
        centrifuga4.db.session.add(s21)
        centrifuga4.db.session.add(s22)
        centrifuga4.db.session.add(s23)"""
        # centrifuga4.db.session.add(s1)
        # centrifuga4.db.session.add(s2)
        # centrifuga4.db.session.add(s3)
        # centrifuga4.db.session.add(s4)
        # centrifuga4.db.session.add(u)
        """centrifuga4.db.session.add(g)
        centrifuga4.db.session.commit()"""

        # print([x.full name for x in Student.query.all()])
        #centrifuga4.db.session.commit()
        app.run(host="0.0.0.0",
                port="4999",
                ssl_context=("cert.pem","key.pem")
                )
