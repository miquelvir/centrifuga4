import unittest

from flask import Flask

from server.blueprints.api.errors import no_nested


class TestNoNestedDecorator(unittest.TestCase):
    def test_allows_empty_body_without_json_content_type(self):
        app = Flask(__name__)

        @app.route("/", methods=["POST"])
        @no_nested
        def view():
            return "ok"

        with app.test_request_context("/", method="POST"):
            self.assertEqual(view(), "ok")


if __name__ == "__main__":
    unittest.main()
