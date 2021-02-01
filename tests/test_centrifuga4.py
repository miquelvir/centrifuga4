from dotenv import load_dotenv
from os.path import join, dirname

from centrifuga4.models import Student
from manual_db_utils.generate_sample_db import add_students

load_dotenv(join(dirname(__file__), "../.env"))


import tempfile
import pytest
import centrifuga4
import os
import unittest
from centrifuga4 import db
from config import TestingConfig


class BaseTest(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        self.app = centrifuga4.init_app(TestingConfig)
        self.app.config["TESTING"] = True
        self.app.config["PREFERRED_URL_SCHEME"] = "https"
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + self.db_path
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)


class ModelsEmptyTest(BaseTest):
    def _test_res(self, resource):
        res = self.client.get("/api/v1/" + resource)
        self.assertEqual(200, res.status_code)
        self.assertListEqual([], res.json["data"])
        self.assertEqual(
            res.json["_links"]["first"]["href"],
            "https://localhost/api/v1/%s?page=1" % resource,
        )
        self.assertEqual(
            res.json["_links"]["last"]["href"],
            "https://localhost/api/v1/%s?page=1" % resource,
        )
        self.assertEqual(
            res.json["_links"]["self"]["href"],
            "https://localhost/api/v1/%s?page=1" % resource,
        )
        self.assertEqual(res.json["_links"]["next"], None)
        self.assertEqual(res.json["_links"]["prev"], None)
        self.assertEqual(res.json["_pagination"]["currentPage"], 1)
        self.assertEqual(res.json["_pagination"]["hasNext"], False)
        self.assertEqual(res.json["_pagination"]["hasPrev"], False)
        self.assertEqual(res.json["_pagination"]["nextPage"], None)
        self.assertEqual(res.json["_pagination"]["perPage"], 10)
        self.assertEqual(res.json["_pagination"]["prevPage"], None)
        self.assertEqual(res.json["_pagination"]["totalItems"], 0)
        self.assertEqual(res.json["_pagination"]["totalPages"], 0)

    def test_courses(self):
        return self._test_res("courses")

    def test_guardians(self):
        return self._test_res("guardians")

    def test_teachers(self):
        return self._test_res("teachers")

    def test_payments(self):
        return self._test_res("payments")

    def test_rooms(self):
        return self._test_res("rooms")

    def test_schedules(self):
        return self._test_res("schedules")

    def test_users(self):
        return self._test_res("users")


class StudentsTest(BaseTest):
    def setUp(self):
        super().setUp()
        with self.app.app_context():
            add_students(5)
            db.session.commit()

    def test_get(self):
        res = self.client.get("/api/v1/students?page=*")
        data = res.json["data"]

        self.assertEqual(200, res.status_code)
        with self.app.app_context():
            for student in Student.query.all():
                student2 = None
                for s in data:
                    if s["id"] == student.id:
                        student2 = s
                self.assertIsNotNone(student2)
                self.assertEqual([s["id"] for s in data].count(student.id), 1)
                self.assertEqual(student.name, student2["name"])
                self.assertEqual(student.surname1, student2["surname1"])
                self.assertEqual(student.surname2, student2["surname2"])
                self.assertEqual(student.full_name, student2["full_name"])


if __name__ == "__main__":
    unittest.main()
