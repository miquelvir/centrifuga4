import os


SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
SMTP_DOMAIN = os.environ["SMTP_DOMAIN"]
SMTP_USER = os.environ["SMTP_USER"]
SMTP_FROM_EMAIL = SMTP_USER  # email which will be shown in the 'from' field
SMTP_REPLY_TO = SMTP_FROM_EMAIL
SMTP_TLS_PORT = 465

SMTP_BULK_PASSWORD = os.environ["SMTP_BULK_PASSWORD"]
SMTP_BULK_USER = os.environ["SMTP_BULK_USER"]
SMTP_BULK_DOMAIN = os.environ["SMTP_BULK_DOMAIN"]
SMTP_BULK_FROM_EMAIL = SMTP_USER  # email which will be shown in the 'from' field
SMTP_BULK_REPLY_TO = SMTP_REPLY_TO
SMTP_BULK_PORT = 587

BCC_ADMIN = False

DEBUGGING_EMAIL = "vazquezrius.miquel@gmail.com"
DEBUGGING_MODE = bool(int(os.environ["EMAIL_DEBUGGING_MODE"]))
DEBUGGING_SEND_EMAILS = True

dirname = os.path.dirname(__file__)  # current directory
TEMPLATES_FOLDER = os.path.join(dirname, "templates")  # relative to main.py
