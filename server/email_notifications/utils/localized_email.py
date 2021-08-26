from email import encoders
from email.mime import base, multipart, text
from email.mime.application import MIMEApplication
from io import BytesIO

from dataclasses import dataclass
from typing import List, Tuple, Iterable

from flask import current_app

config = current_app.config

from server.email_notifications.utils.config import TEMPLATES_FOLDER
import os
import json

from server.jinja_utils.template_renderer import TemplateRenderer

_FROM = "From"
_TO = "To"
_CC = "Cc"
_BCC = "Bcc"
_SUBJECT = "Subject"
_PLAIN = "plain"
_HTML = "html"
_REPLY_TO = "Reply-To"


class EmailTemplateError(ValueError):
    def __init__(self, text, *args, **kwargs):
        super().__init__(f"Invalid email template. {text}", *args, **kwargs)


@dataclass
class Email:
    _subject: str = None
    to: Iterable[str] = None
    cc: List[str] = None
    bcc: List[str] = None
    files: List[Tuple[BytesIO, str]] = None

    @property
    def subject(self):
        return self._subject

    @property
    def plain_body(self):
        return None

    @property
    def html_body(self):
        return None

    @staticmethod
    def _get_attachment_part(filepath: str, filename: str) -> base.MIMEBase:
        """given a filepath and its final filename, return a MIMEBase part for it"""
        # use original filename if no new filename given
        filename = filepath.split("\\")[-1] if filename is None else filename

        part = base.MIMEBase(
            "application", "octet-stream"
        )  # create octet-stream MIME part for the attachment
        with open(
            filepath, "rb"
        ) as attachment:  # open file in binary mode and add to part
            part.set_payload(attachment.read())

        # Encode file in ASCII characters to send by email
        encoders.encode_base64(part)

        # Add header as key/value pair to attachment part
        part.add_header("Content-Disposition", f"attachment; filename={filename}")

        return part

    @staticmethod
    def _get_attachment_part_f(attachment, filename) -> base.MIMEBase:
        """given a filepath and its final filename, return a MIMEBase part for it"""
        part = MIMEApplication(attachment.read(), "pdf")

        # Add header as key/value pair to attachment part
        part.add_header("Content-Disposition", "attachment", filename=filename)

        return part

    def message(self):
        """send a message using the server"""

        # create a multipart message and set headers
        message = multipart.MIMEMultipart()
        message[_SUBJECT] = self.subject

        if self.to is not None:
            message[_TO] = (
                ", ".join(set(self.to))
                if not config["DEBUGGING_MODE"]
                else config["DEBUGGING_EMAIL"]
            )

        if self.cc:
            message[_CC] = (
                ", ".join(set(self.cc))
                if not config["DEBUGGING_MODE"]
                else config["DEBUGGING_EMAIL"]
            )

        if self.bcc:
            message[_BCC] = (
                ", ".join(
                    set(self.bcc)
                    if not config["BCC_ADMIN"]
                    else set(self.bcc + [config["DEBUGGING_EMAIL"]])
                )
                if not config["DEBUGGING_MODE"]
                else config["DEBUGGING_EMAIL"]
            )  # if BCC admin is True, send it to all bcc AND the debugging email
        elif config["BCC_ADMIN"]:
            message[_BCC] = config["DEBUGGING_EMAIL"]

        # add plain text to the body if given
        if self.plain_body:
            message.attach(text.MIMEText(self.plain_body, _PLAIN))

        # add html to the body if given
        if self.html_body:
            message.attach(text.MIMEText(self.html_body, _HTML))

        # add attachments if given
        if self.files:
            for filepath, filename in self.files:
                if type(filepath) is str:
                    message.attach(self._get_attachment_part(filepath, filename))
                else:
                    message.attach(self._get_attachment_part_f(filepath, filename))

        return message


@dataclass
class ThemedEmail(Email):
    template_name: str = None
    variables: dict = None

    def _load_template(self):
        pass

    def __post_init__(self):
        if self.template_name is None:
            raise EmailTemplateError(
                "No template_name given (template_name is 'None')."
            )
        if self.variables is None:
            self.variables = {}
        self._load_template()
        self._tr = TemplateRenderer(TEMPLATES_FOLDER)

    @property
    def _path_template(self):
        return os.path.join(TEMPLATES_FOLDER, self.template_name)

    @property
    def _path_body(self):
        return os.path.join(self._path_template, "body.html")

    @property
    def _path_plain(self):
        return os.path.join(self._path_template, "plain.txt")

    def _render_template(self, **kwargs):
        return self._tr.render_template(
            f"{self.template_name}/body.html",
            __subject__=self.subject,
            **self.variables,
            **kwargs,
        )

    @property
    def html_body(self):
        return self._render_template()


@dataclass
class DefinitionEmail(Email):
    template_name: str = None
    variables: dict = None

    def __post_init__(self):
        if self.template_name is None:
            raise EmailTemplateError(
                "No template_name given (template_name is 'None')."
            )
        if self.variables is None:
            self.variables = {}

        self._load_template()
        self._tr = TemplateRenderer(TEMPLATES_FOLDER)

    @property
    def _path_template(self):
        return os.path.join(TEMPLATES_FOLDER, self.template_name)

    @property
    def _path_body(self):
        return os.path.join(self._path_template, "body.html")

    @property
    def _path_definition(self):
        return os.path.join(self._path_template, "definition.json")

    @property
    def _path_plain(self):
        return os.path.join(self._path_template, "plain.txt")

    def _assert_template_definition_exists(self):
        if not os.path.exists(self._path_definition):
            raise EmailTemplateError(
                f"A definition should be found in {self._path_definition}"
            )

    def _load_definition(self):
        with open(self._path_definition, encoding="utf-8") as f:
            self._definition = json.load(f)
        if "subject" not in self._definition:
            raise EmailTemplateError(
                f"No 'subject' field found in the email definition in {self._path_definition}"
            )

    @property
    def subject(self):
        return self._definition["subject"]

    def _load_template(self):
        self._assert_template_definition_exists()
        self._load_definition()

    def _render_template(self, **kwargs):
        return self._tr.render_template(
            f"{self.template_name}/body.html",
            __subject__=self.subject,
            **self.variables,
            **kwargs,
        )

    @property
    def html_body(self):
        return self._render_template()


@dataclass
class LocalizedEmail(DefinitionEmail):
    def __post_init__(self):
        super().__post_init__()
        self._load_localizations()

    @property
    def _path_translations(self):
        return os.path.join(self._path_template, "translations")

    def _assert_translations_exists(self):
        if not os.path.exists(self._path_translations):
            raise EmailTemplateError(
                f"A translations folder should be found in {self._path_translations}"
            )

    def _assert_translation_exists(self, language):
        if not os.path.exists(self._translation_path(language)):
            raise EmailTemplateError(
                f"A translation file should be found in {self._path_translations} or language {language!r} removed from the definition in {self._path_definition}."
            )

    def _load_translation(self, language):
        self._assert_translation_exists(language)
        with open(self._translation_path(language), encoding="utf-8") as f:
            translation = json.load(f)
        self._translations[language] = translation

    def _translation_path(self, language):
        return os.path.join(self._path_translations, f"{language}.json")

    def _load_definition(self):
        super()._load_definition()
        if "languages" not in self._definition:
            raise EmailTemplateError(
                f"No 'languages' field found in the email definition in {self._path_definition}"
            )
        if "defaultLanguage" not in self._definition:
            raise EmailTemplateError(
                f"No 'defaultLanguage' field found in the email definition in {self._path_definition}"
            )

    def _load_localizations(self):
        self._translations = {}

        self._assert_translations_exists()
        for language in self.languages:
            self._load_translation(language)

    @property
    def languages(self):
        return self._definition["languages"].copy()

    @property
    def default_language(self):
        return self._definition["defaultLanguage"]

    def _load_template(self):
        super()._load_template()
        self._load_localizations()

    def _render_template(self, language=None, **kwargs):
        if language is None:
            language = self.default_language
        return self._tr.render_template(
            f"{self.template_name}/body.html",
            __subject__=self.subject,
            __lan__=language,
            **self._translations[language],
            **self.variables,
            **kwargs,
        )
