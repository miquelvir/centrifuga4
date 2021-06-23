import os
from os.path import join, dirname
from dotenv import load_dotenv

from manual_db_utils.generate_sample_db import need_attendance

load_dotenv(join(dirname(__file__), "../.env"))

from config import HerokuManualLiveConfig


if __name__ == "__main__":
    import centrifuga4

    if input("type 'production'") == "production":
        app = centrifuga4.init_app(HerokuManualLiveConfig)
        with app.app_context():
            centrifuga4.db.session.add(need_attendance)
            centrifuga4.db.session.commit()
