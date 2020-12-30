import centrifuga4
from config import ProductionConfig

app = centrifuga4.init_app(ProductionConfig)


if __name__ == "__main__":
    with app.app_context():
        app.run(host="0.0.0.0",
                port="4999",
                ssl_context=("cert.pem", "key.pem"))
