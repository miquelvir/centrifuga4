from os.path import join, dirname
from dotenv import load_dotenv
load_dotenv(join(dirname(__file__), '.env'))

from centrifuga4.models import User


if __name__ == "__main__":
    import centrifuga4
    from development import manual_heroku_config as config
    from development.generate_sample_db import all_needs

    app = centrifuga4.init_app(config.HerokuManualLiveConfig)
    with app.app_context():
        admin = User(id=User.generate_new_id(),
                     name="admin2",
                     surname1="admin",
                     surname2="admin",
                     email="admin2@gmail.com",
                     username="admin2@gmail.com",
                     password_hash=User.hash_password("admin2"))

        """for need in all_needs:
            admin.needs.append(need)"""

        centrifuga4.db.session.add(admin)
        centrifuga4.db.session.commit()
