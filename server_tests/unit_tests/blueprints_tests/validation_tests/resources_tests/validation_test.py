import unittest


from typing import TYPE_CHECKING
from unittest.mock import Mock

from parameterized import parameterized

from server.services.jwt_service import JwtService
from server_tests.database_test_utils import WithApp

VALIDATION_URL = "/validation/v1"


class TestValidationGet(WithApp):
    def setUp(self):
        super().setUp()
        self.mock_jwt_service = Mock(JwtService)

    @parameterized.expand(
        [
            (True, "The document has passed validation"),
            (False, "The document has not passed validation"),
        ]
    )
    def test_returns_invalid_document_if_invalid_jwt(
        self, is_valid: bool, expected_text: str
    ):
        # Arrange
        self.mock_jwt_service.is_valid.return_value = is_valid, {}
        sample_token = "a-token"

        # Act
        with self.app.app_context(), self.app.container.jwt_service.override(
            self.mock_jwt_service
        ) as ctx:
            r = self.client.get(f"{VALIDATION_URL}/{sample_token}", json=None)

        # Assert
        self.assertEqual(r.status_code, 200)
        self.assertTrue(expected_text in r.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()
