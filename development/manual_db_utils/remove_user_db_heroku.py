from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), "../../.env"))

from server.models import User, Need


if __name__ == "__main__":
    import server
    import manual_heroku_config as config

    app = server.init_app(config.HerokuManualLiveConfig)
    with app.app_context():
        admin = User.query.filter(User.email == "vazquezrius.miquel@gmail.com").first()
        server.db.session.delete(admin)
        server.db.session.commit()
