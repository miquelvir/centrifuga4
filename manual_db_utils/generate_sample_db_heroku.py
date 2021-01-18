from os.path import join, dirname
from dotenv import load_dotenv

from config import HerokuManualLiveConfig


if __name__ == "__main__":
    import centrifuga4
    from generate_sample_db import add_all

    app = centrifuga4.init_app(HerokuManualLiveConfig)
    with app.app_context():
        add_all()
