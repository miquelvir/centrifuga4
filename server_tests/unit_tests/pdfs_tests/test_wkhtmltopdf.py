import os
import unittest
from unittest.mock import patch

from server.pdfs.wkhtmltopdf import get_config


class TestWKHTMLToPDFConfig(unittest.TestCase):
    @patch("server.pdfs.wkhtmltopdf.pdfkit.configuration")
    @patch("server.pdfs.wkhtmltopdf.shutil.which", return_value="/usr/bin/wkhtmltopdf")
    def test_uses_path_from_shutil_when_env_is_missing(self, mock_which, mock_configuration):
        with patch.dict(os.environ, {}, clear=True):
            get_config()

        mock_which.assert_called_once_with("wkhtmltopdf")
        mock_configuration.assert_called_once_with(wkhtmltopdf="/usr/bin/wkhtmltopdf")

    @patch("server.pdfs.wkhtmltopdf.pdfkit.configuration")
    def test_prefers_explicit_environment_path(self, mock_configuration):
        with patch.dict(os.environ, {"wkhtmltopdf": "/custom/bin/wkhtmltopdf"}, clear=True):
            get_config()

        mock_configuration.assert_called_once_with(wkhtmltopdf="/custom/bin/wkhtmltopdf")


if __name__ == "__main__":
    unittest.main()
