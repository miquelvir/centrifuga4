import os
import tempfile
import sqlalchemy.dialects.sqlite

import pytest

import centrifuga4


@pytest.fixture
def client():
    app = centrifuga4.init_app("config.TestingConfig")
    app.config['TESTING'] = True
    app.config["PREFERRED_URL_SCHEME"] = "https"
    with app.test_client() as client:
        app.app_context().push()
        centrifuga4.db.drop_all()
        centrifuga4.db.create_all()
        yield client


if __name__ == "__main__":
    pytest.main()
