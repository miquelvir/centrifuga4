import smtplib
import ssl
import logging as log
from .localized_email import LocalizedEmail
from flask import current_app

_FROM = "From"
_TO = "To"
_CC = "Cc"
_BCC = "Bcc"
_SUBJECT = "Subject"
_PLAIN = "plain"
_HTML = "html"
_REPLY_TO = "Reply-To"


class EmailSender:
    """allows for SSL secure email sending; optionally with html emails and/or attachments"""

    def __init__(
        self,
        domain: str = current_app.config["SMTP_DOMAIN"],
        port: int = current_app.config["SMTP_TLS_PORT"],
        user: str = current_app.config["SMTP_USER"],
        from_: str = current_app.config["SMTP_FROM_EMAIL"],
        password: str = current_app.config["SMTP_PASSWORD"],
        reply_to: str = current_app.config["SMTP_REPLY_TO"],
        use_ssl: bool = True,
    ):
        """initialise an ssl context, and an SMTP connection using the previous context; login using credentials"""
        self._from = (
            from_ if from_ else user
        )  # save from email, defaults to user if not given
        self._reply_to = reply_to if reply_to else user  # defaults to user if not given

        if use_ssl:
            self._context = ssl.create_default_context()  # ssl context
            self._server = smtplib.SMTP_SSL(
                domain, port, context=self._context
            )  # smtp connection
        else:
            self._server = smtplib.SMTP(domain, port)  # smtp connection
            self._server.ehlo()  # Can be omitted
            self._server.starttls()  # Secure the connection
            self._server.ehlo()  # Can be omitted

        # login with credentials
        try:
            self._login(user, password)
        except ValueError:
            raise  # upper layer is to handle

        log.debug(
            "started smtp connection with server...\n  domain: {domain}\n  TLS port: {port}\n  user: {user}\n  from "
            "email: {from_}".format(domain=domain, port=port, user=user, from_=from_)
        )

    @classmethod
    def init_bulk(
        cls,
        domain: str = current_app.config["SMTP_BULK_DOMAIN"],
        port: int = current_app.config["SMTP_BULK_PORT"],
        user: str = current_app.config["SMTP_BULK_USER"],
        from_: str = current_app.config["SMTP_BULK_FROM_EMAIL"],
        password: str = current_app.config["SMTP_BULK_PASSWORD"],
        reply_to: str = current_app.config["SMTP_BULK_REPLY_TO"],
        use_ssl: bool = False,
    ):
        return cls(domain, port, user, from_, password, reply_to, use_ssl)

    def _start_tls(self):
        """start TLS in the server connection using context"""
        try:
            self._server.starttls(context=self._context)
        except (
            smtplib.SMTPNotSupportedError,
            RuntimeError,
            ValueError,
            smtplib.SMTPResponseException,
        ) as e:
            log.exception("exception starting TLS using context")
            raise ValueError("can't start TLS using context") from e

    def _login(self, user: str, password: str):
        """given a user and password, login to the server connection"""
        try:
            self._server.login(user, password)
        except (
            smtplib.SMTPNotSupportedError,
            smtplib.SMTPException,
            smtplib.SMTPAuthenticationError,
        ) as e:
            log.exception("exception during login to the smtp server")
            raise ValueError("smtp login failed") from e

    def send(self, email: LocalizedEmail):
        """send a message using the server"""
        config = current_app.config

        # create a multipart message and set headers
        message = email.message()
        message[_FROM] = self._from
        message[_REPLY_TO] = self._reply_to

        # send message using server
        if not config["DEBUGGING_MODE"] or config["DEBUGGING_SEND_EMAILS"]:
            result = self._server.send_message(message)
        else:
            result = {}
            log.debug(
                "email would have been sent, but it has not, since DEBUGGING_MODE and DEBUGGING_SEND_EMAILS is enabled"
            )

        log.debug(
            "email with subject '{subject}' sent...\n  to: {to}\n  cc: {cc}\n  bcc: {bcc}\n  attachments: {"
            "attachments}".format(
                subject=email.subject,
                to="'%s' (if not in debugging mode, it would have been sent to: '%s')"
                % (config["DEBUGGING_EMAIL"] if email.to else None, email.to)
                if config["DEBUGGING_MODE"]
                else email.to,
                cc="'%s' (if not in debugging mode, it would have been sent to: '%s')"
                % (config["DEBUGGING_EMAIL"] if email.cc else None, email.cc)
                if config["DEBUGGING_MODE"]
                else email.cc,
                bcc="'%s' (if not in debugging mode, it would have been sent to: '%s')"
                % (config["DEBUGGING_EMAIL"] if email.bcc else None, email.bcc)
                if config["DEBUGGING_MODE"]
                else email.bcc,
                attachments=email.files,
            )
        )

        return result

    def close(self):
        """close the connection with the server"""
        self._server.close()

    def __enter__(self):
        """with statement initiated"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """on with statement exit, close server connection"""
        self.close()
