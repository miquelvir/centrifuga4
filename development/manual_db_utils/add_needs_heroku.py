from os.path import join, dirname
from dotenv import load_dotenv

from development.manual_db_utils.generate_sample_db import need_attendance

load_dotenv(join(dirname(__file__), "../../.env"))

from config import HerokuManualLiveConfig


if __name__ == "__main__":
    import server

    if input("type 'production'") == "production":
        app = server.init_app(HerokuManualLiveConfig)
        with app.app_context():
            server.db.session.add(need_attendance)
            server.db.session.commit()
