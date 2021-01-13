import os
from email_queue import email_secrets

SMTP_TLS_PORT = 465
SMTP_DOMAIN = "smtp.xamfra.net"
SMTP_USER = "xamfra@xamfra.net"  # user
SMTP_PASSWORD = email_secrets.SMTP_PASSWORD  # password
SMTP_FROM_EMAIL = SMTP_USER  # email which will be shown in the 'from' field
SMTP_REPLY_TO = SMTP_FROM_EMAIL
BCC_ADMIN = False

DEBUGGING_EMAIL = "vazquezrius.miquel@gmail.com"
DEBUGGING_MODE = True
DEBUGGING_SEND_EMAILS = True

dirname = os.path.dirname(__file__)  # current directory
TEMPLATES_FOLDER = os.path.join(dirname, "templates")  # relative to main.py
