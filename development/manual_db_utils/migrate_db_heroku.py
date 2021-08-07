from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), "../../.env"))

from config import HerokuManualLiveConfig


if __name__ == "__main__":
    import server
    from migrate_db import migrate_all

    if input("type 'production'") == "production":
        app = server.init_app(HerokuManualLiveConfig)
        with app.app_context():
            migrate_all(input("path: "))
