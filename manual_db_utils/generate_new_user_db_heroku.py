from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), "../.env"))

from centrifuga4.models import User, Need


if __name__ == "__main__":
    import centrifuga4
    import manual_heroku_config as config
    from generate_sample_db import all_needs

    app = centrifuga4.init_app(config.HerokuManualLiveConfig)
    with app.app_context():
        admin = User(
            id=User.generate_new_id(),
            name="admin4",
            surname1="admin",
            surname2="admin",
            email="admin4@gmail.com",
            username="admin4@gmail.com",
            password_hash=User.hash_password("admin4"),
        )

        for need in all_needs:
            admin.needs.append(Need.query.filter(Need.name == need.name).first())

        centrifuga4.db.session.add(admin)
        centrifuga4.db.session.commit()
