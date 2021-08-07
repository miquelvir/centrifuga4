import server
from config import ProductionConfig

app = server.init_app(ProductionConfig)


if __name__ == "__main__":
    with app.app_context():
        app.run(
            host=app.config["BACKEND_SERVER_HOST"],
            port=app.config["BACKEND_SERVER_PORT"],
        )
