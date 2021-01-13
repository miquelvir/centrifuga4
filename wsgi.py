import centrifuga4
from config import ProductionConfig

app = centrifuga4.init_app(ProductionConfig)


if __name__ == "__main__":
    with app.app_context():
        app.run(
            host=app.config["BACKEND_SERVER_HOST"],  # todo config vars directly
            port=app.config["BACKEND_SERVER_PORT"],
        )
