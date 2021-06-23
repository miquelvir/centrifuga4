import os
from os.path import join, dirname
from dotenv import load_dotenv


load_dotenv(join(dirname(__file__), "../.env"))

from config import HerokuManualLiveConfig


def get_needs():
    needs = Need.query.all()
    for need in needs:
        print(need)


if __name__ == "__main__":
    import centrifuga4
    from centrifuga4.models import Need

    if input("type 'production'") == "production":
        app = centrifuga4.init_app(HerokuManualLiveConfig)
        with app.app_context():
            get_needs()
