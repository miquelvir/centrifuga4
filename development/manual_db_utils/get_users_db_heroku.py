from development.manual_db_utils.generate_sample_db import add_roles
from server.models import User, Role

if __name__ == "__main__":
    import server
    import config

    app = server.init_app(config.HerokuManualLiveConfig)
    with app.app_context():
        for user in User.query.filter().first():
            print(user, user.id, user.name, user.surname1, user.surname2, user.role_id)
