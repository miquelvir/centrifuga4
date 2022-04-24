import os
from os.path import join, dirname
from dotenv import load_dotenv


load_dotenv(join(dirname(__file__), "../../.env"))

from config import HerokuManualLiveConfig

import json
import datetime


def get_needs():
    attendances = Attendance.query.count()
    print(attendances)


if __name__ == "__main__":
    import server
    from server.models import Attendance

    if input("type 'production'") == "production":
        app = server.init_app(HerokuManualLiveConfig)
        with app.app_context():
            get_needs()
