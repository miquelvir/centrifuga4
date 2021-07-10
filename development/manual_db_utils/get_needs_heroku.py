import os
from os.path import join, dirname
from dotenv import load_dotenv


load_dotenv(join(dirname(__file__), "../../.env"))

from config import HerokuManualLiveConfig


def get_needs():
    needs = Need.query.all()
    for need in needs:
        print(need)


if __name__ == "__main__":
    import server
    from server.models import Need

    if input("type 'production'") == "production":
        app = server.init_app(HerokuManualLiveConfig)
        with app.app_context():
            get_needs()
