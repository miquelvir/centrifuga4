from os.path import join, dirname
from dotenv import load_dotenv

load_dotenv(join(dirname(__file__), "../.env"))  # use instead pycharm environment vars

import server

app = server.init_app()


if __name__ == "__main__":
    with app.app_context():
        app.run(
            host=app.config["BACKEND_SERVER_HOST"],
            port=app.config["BACKEND_SERVER_PORT"],
            ssl_context=(app.config["SSL_CERT"], app.config["SSL_KEY"]),
        )
