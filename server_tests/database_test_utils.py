import os
import tempfile
import unittest

from config import TestingConfig, TestingConfigNoDb
from development.manual_db_utils.generate_sample_db import add_needs
from server import init_app


def init_db():
    import server

    server.db.drop_all()
    server.db.create_all()
    add_needs()
    server.db.session.commit()


class WithApp(unittest.TestCase):
    def setUp(self, config=TestingConfigNoDb) -> None:
        self.app = init_app(config)
        self.client = self.app.test_client()


class WithDatabase(WithApp):
    def setUp(self) -> None:
        super().setUp(config=TestingConfig)
        self._db_fd, self._db_path = tempfile.mkstemp()
        self.app.config.SQLALCHEMY_DATABASE_URI = f"sqlite:///{self._db_path}"
        with self.app.app_context():
            init_db()

    def tearDown(self) -> None:
        os.close(self._db_fd)
        os.unlink(self._db_path)
