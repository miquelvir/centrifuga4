import smtplib
import ssl
from email import encoders
from email.mime import base
from email.mime import multipart
from email.mime import text
import logging as log
from email.mime.application import MIMEApplication

from . import config
from .my_email import Email

_FROM = "From"
_TO = "To"
_CC = "Cc"
_BCC = "Bcc"
_SUBJECT = "Subject"
_PLAIN = "plain"
_HTML = "html"
_REPLY_TO = "Reply-To"


class EmailSender:
    """ allows for SSL secure email sending; optionally with html emails and/or attachments """

    def __init__(
        self,
        domain: str = config.SMTP_DOMAIN,
        port: int = config.SMTP_TLS_PORT,
        user: str = config.SMTP_USER,
        from_: str = config.SMTP_FROM_EMAIL,
        password: str = config.SMTP_PASSWORD,
        reply_to: str = config.SMTP_REPLY_TO,
        use_ssl: bool = True,
    ):
        """ initialise an ssl context, and an SMTP connection using the previous context; login using credentials """
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
        domain: str = config.SMTP_BULK_DOMAIN,
        port: int = config.SMTP_BULK_PORT,
        user: str = config.SMTP_BULK_USER,
        from_: str = config.SMTP_BULK_FROM_EMAIL,
        password: str = config.SMTP_BULK_PASSWORD,
        reply_to: str = config.SMTP_BULK_REPLY_TO,
        use_ssl: bool = False,
    ):
        return cls(domain, port, user, from_, password, reply_to, use_ssl)

    def _start_tls(self):
        """ start TLS in the server connection using context """
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
        """ given a user and password, login to the server connection """
        try:
            self._server.login(user, password)
        except (
            smtplib.SMTPNotSupportedError,
            smtplib.SMTPException,
            smtplib.SMTPAuthenticationError,
        ) as e:
            log.exception("exception during login to the smtp server")
            raise ValueError("smtp login failed") from e

    @staticmethod
    def get_attachment_part(filepath: str, filename: str) -> base.MIMEBase:
        """ given a filepath and its final filename, return a MIMEBase part for it """
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
    def get_attachment_part_f(attachment, filename) -> base.MIMEBase:
        """ given a filepath and its final filename, return a MIMEBase part for it """
        """part = base.MIMEBase("application", "octet-stream")  # create octet-stream MIME part for the attachment
        part.set_payload(attachment.read())

        # Encode file in ASCII characters to send by email
        encoders.encode_base64(part)"""

        part = MIMEApplication(attachment.read(), "pdf")

        # Add header as key/value pair to attachment part
        part.add_header("Content-Disposition", "attachment", filename=filename)

        return part

    def send(self, email: Email):
        """ send a message using the server """

        # create a multipart message and set headers
        message = multipart.MIMEMultipart()
        message[_FROM] = self._from
        message[_SUBJECT] = email.subject
        message[_REPLY_TO] = self._reply_to

        if email.to:
            message[_TO] = (
                ", ".join(email.to)
                if not config.DEBUGGING_MODE
                else config.DEBUGGING_EMAIL
            )

        if email.cc:
            message[_CC] = (
                ", ".join(email.cc)
                if not config.DEBUGGING_MODE
                else config.DEBUGGING_EMAIL
            )

        if email.bcc:
            message[_BCC] = (
                ", ".join(
                    email.bcc
                    if not config.BCC_ADMIN
                    else email.bcc + [config.DEBUGGING_EMAIL]
                )
                if not config.DEBUGGING_MODE
                else config.DEBUGGING_EMAIL
            )  # if BCC admin is True, send it to all bcc AND the debugging email
        elif config.BCC_ADMIN:
            message[_BCC] = config.DEBUGGING_EMAIL

        # add plain text to the body if given
        if email.plain_body:
            message.attach(text.MIMEText(email.plain_body, _PLAIN))

        # add html to the body if given
        if email.html_body:
            message.attach(text.MIMEText(email.html_body, _HTML))

        # add attachments if given
        if email.files:
            for filepath, filename in email.files:
                if type(filepath) is str:
                    message.attach(self.get_attachment_part(filepath, filename))
                else:
                    message.attach(self.get_attachment_part_f(filepath, filename))

        # send message using server
        if not config.DEBUGGING_MODE or config.DEBUGGING_SEND_EMAILS:
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
                % (config.DEBUGGING_EMAIL if email.to else None, email.to)
                if config.DEBUGGING_MODE
                else email.to,
                cc="'%s' (if not in debugging mode, it would have been sent to: '%s')"
                % (config.DEBUGGING_EMAIL if email.cc else None, email.cc)
                if config.DEBUGGING_MODE
                else email.cc,
                bcc="'%s' (if not in debugging mode, it would have been sent to: '%s')"
                % (config.DEBUGGING_EMAIL if email.bcc else None, email.bcc)
                if config.DEBUGGING_MODE
                else email.bcc,
                attachments=email.files,
            )
        )

        return result

    def close(self):
        """ close the connection with the server """
        self._server.close()

    def __enter__(self):
        """ with statement initiated """
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """ on with statement exit, close server connection """
        self.close()
