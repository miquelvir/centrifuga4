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
            with patch("server.pdfs.wkhtmltopdf.os.path.exists", return_value=True):
                get_config()

        mock_configuration.assert_called_once_with(wkhtmltopdf="/custom/bin/wkhtmltopdf")

    @patch("server.pdfs.wkhtmltopdf.pdfkit.configuration")
    @patch("server.pdfs.wkhtmltopdf.shutil.which", return_value="/usr/bin/wkhtmltopdf")
    def test_ignores_missing_environment_path_and_falls_back(self, mock_which, mock_configuration):
        with patch.dict(os.environ, {"wkhtmltopdf": "/app/bin/wkhtmltopdf"}, clear=True):
            with patch("server.pdfs.wkhtmltopdf.os.path.exists", side_effect=lambda path: path == "/usr/bin/wkhtmltopdf"):
                get_config()

        mock_configuration.assert_called_once_with(wkhtmltopdf="/usr/bin/wkhtmltopdf")

    def test_raises_when_no_executable_can_be_found(self):
        with patch.dict(os.environ, {}, clear=True):
            with patch("server.pdfs.wkhtmltopdf.os.path.exists", return_value=False):
                with patch("server.pdfs.wkhtmltopdf.shutil.which", return_value=None):
                    with self.assertRaisesRegex(RuntimeError, "wkhtmltopdf executable"):
                        get_config()


if __name__ == "__main__":
    unittest.main()
