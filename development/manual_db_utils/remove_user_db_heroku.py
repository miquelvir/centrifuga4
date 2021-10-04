from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), "../../.env"))

from server.models import User, Person


if __name__ == "__main__":
    import server
    from config import HerokuManualLiveConfig

    app = server.init_app(HerokuManualLiveConfig)
    with app.app_context():
        print(User.query.filter(User.email == "marcriera@emmvilafranca.cat").count())
