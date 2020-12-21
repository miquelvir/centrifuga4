import centrifuga4
app = centrifuga4.init_app("config.DevelopmentConfig")


@app.route("/hi")
def _hi():
    return "hiiiiiiiiii"


if __name__ == "__main__":
    with app.app_context():
        #centrifuga4.db.drop_all()
        #centrifuga4.db.create_all()
        """s = Student(id="john", name="john")
        s.guardians.append(Guardian(id="ua81-john", name="ua81-john", relation="mother"))
        u = User(id="admin", name="admin", username="admin", password_hash=pwd_context.hash("admin"), privilege_read=True)
        g = Guardian(id="g", name="guard")"""
        # u = User(id="admin", name="admin", username="admin", password_hash=pwd_context.hash("admin"))

        """centrifuga4.db.session.add(s)
        centrifuga4.db.session.add(u)
        centrifuga4.db.session.add(g)
        centrifuga4.db.session.commit()"""

        app.run(host="0.0.0.0",
                port="4999",
                ssl_context=("cert.pem","key.pem")
                )
