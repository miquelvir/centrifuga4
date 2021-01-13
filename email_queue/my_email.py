from dataclasses import dataclass
from typing import List, Tuple


@dataclass
class Email:
    """
    email object which can be sent using the EmailSender
    subject: str, the subject line for the email
    to: List[str], a list of destination emails (to) or None
    to: List[str], a list of destination emails (to) or None
    cc: List[str], a list of destination emails (cc) or None
    bcc: List[str], a list of destination emails (bcc) or None
    files: List[Tuple[str, str]], a list of tuples (path of the file to attach, name of the attachment) or None
    plain_body: str, the plain text body for the email or None
    html_body: str, the html body for the email or None
    """

    subject: str
    to: List[str] = None
    cc: List[str] = None
    bcc: List[str] = None
    files: List[Tuple[str, str]] = None
    plain_body: str = None
    html_body: str = None
