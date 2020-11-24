import centrifuga4
from passlib.apps import custom_app_context as pwd_context

from centrifuga4.models import Student, Guardian, User

app = centrifuga4.init_app("config.DevelopmentConfig")

if __name__ == "__main__":
    with app.app_context():
        centrifuga4.db.drop_all()
        centrifuga4.db.create_all()
        s = Student(id="john", name="john")
        s.guardians.append(Guardian(id="ua81-john", name="ua81-john", relation="mother"))
        u = User(id="admin", name="admin", username="admin", password_hash=pwd_context.hash("admin"), privilege_read=True)
        g = Guardian(id="g", name="guard")

        centrifuga4.db.session.add(s)
        centrifuga4.db.session.add(u)
        centrifuga4.db.session.add(g)
        centrifuga4.db.session.commit()
        app.run(host="0.0.0.0",
                port="443",
                ssl_context=("W:\\centrifuga4\\development_deployment\\cert.pem",
                             "W:\\centrifuga4\\development_deployment\\key.pem"))
