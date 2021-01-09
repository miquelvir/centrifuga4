import centrifuga4
from development.config import DevelopmentConfig

app = centrifuga4.init_app(DevelopmentConfig)


if __name__ == "__main__":
    with app.app_context():
        app.run(host=app.config['BACKEND_SERVER_HOST'],
                port=app.config['BACKEND_SERVER_PORT'],
                ssl_context=(app.config['SSL_CERT'],
                             app.config['SSL_KEY']))
