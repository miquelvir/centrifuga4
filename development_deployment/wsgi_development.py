import centrifuga4
from config import DevelopmentConfig

app = centrifuga4.init_app(DevelopmentConfig)


if __name__ == "__main__":
    with app.app_context():
        app.run(host="0.0.0.0",
                port="4999",
                ssl_context=("cert.pem", "key.pem"))
