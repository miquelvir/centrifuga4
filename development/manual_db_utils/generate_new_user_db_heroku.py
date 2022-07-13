from os.path import join, dirname
from dotenv import load_dotenv


load_dotenv(join(dirname(__file__), "../../.env"))

from server.models import User, Role


def ask_admin_user():
    admin = User(
        id=User.generate_new_id(),
        name=input("name: "),
        surname1=input("surname1: "),
        surname2=input("surname2: "),
        email=input("email: "),
        password_hash=User.hash_password(input("password: ")),
        role_id=Role.ADMINISTRATOR,
    )

    return admin


def add_admin_user():
    from server import db

    admin = ask_admin_user()
    db.session.add(admin)


if __name__ == "__main__":
    import server

    import config

    if input("type 'production'") == "production":
        app = server.init_app(config.HerokuManualLiveConfig)
        with app.app_context():

            add_admin_user()
            server.db.session.commit()
