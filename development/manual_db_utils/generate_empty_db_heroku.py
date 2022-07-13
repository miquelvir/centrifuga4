from os.path import join, dirname
from dotenv import load_dotenv


load_dotenv(join(dirname(__file__), "../../.env"))

from config import HerokuManualLiveConfig
import server


def create():
    print("dropping... [1]")
    server.db.drop_all()  # drop previous schemas
    print("creating... [2]")
    server.db.create_all()  # load new schemas
    print("adding labels... [4]")
    add_labels()
    print("adding roles... ")
    add_roles()
    print("adding users... [5]")

    print("commiting... [10]")
    server.db.session.commit()


if __name__ == "__main__":
    if input("type 'production'") == "production":
        app = server.init_app(HerokuManualLiveConfig)
        with app.app_context():
            from development.manual_db_utils.generate_new_user_db_heroku import (
                add_admin_user,
            )
            from development.manual_db_utils.generate_sample_db import (
                add_labels,
                add_roles,
            )

            create()
