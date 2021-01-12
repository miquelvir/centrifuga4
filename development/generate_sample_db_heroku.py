import os
from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), '.env'))


if __name__ == "__main__":
    import centrifuga4
    from development import config
    from development.generate_sample_db import add_all

    app = centrifuga4.init_app(config.HerokuManualLiveConfig)
    with app.app_context():
        add_all()
