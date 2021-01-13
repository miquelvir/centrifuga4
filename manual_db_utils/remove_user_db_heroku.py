from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), "../.env"))

from centrifuga4.models import User, Need


if __name__ == "__main__":
    import centrifuga4
    import manual_heroku_config as config

    app = centrifuga4.init_app(config.HerokuManualLiveConfig)
    with app.app_context():
        admin = User.query.filter(User.email == "vazquezrius.miquel@gmail.com").first()
        centrifuga4.db.session.delete(admin)
        centrifuga4.db.session.commit()
