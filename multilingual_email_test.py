from email.message import EmailMessage
from email.mime import text, multipart, base, message

from config import DevelopmentBuiltConfig
from server import init_app

msg = multipart.MIMEMultipart()
msg['From'] = 'xamfra@xamfra.net'
msg['To'] = 'vazquezrius.miquel@gmail.com'
msg['Subject'] = 'Example of a message in Spanish and English'

suben = EmailMessage()
suben['Content-Translation-Type'] = 'original'
suben['Subject'] = 'Example of a message in Spanish and English'
suben.set_content("Hello, this message content is provided in your language.")
suben.add_header('Content-Language', 'en-GB')
suben['From'] = 'xamfra@xamfra.net'
suben['To'] = 'vazquezrius.miquel@gmail.com'

subes = EmailMessage()
subes['Content-Translation-Type'] = 'human'
subes['Subject'] = 'Ejemplo práctico de mensaje en español e inglés'
subes.set_content("Hole, este mensaje esta en esp.")
subes.add_header('Content-Language', 'es-ES')
subes['From'] = 'xamfra@xamfra.net'
subes['To'] = 'vazquezrius.miquel@gmail.com'
subes['Content-Disposition'] = 'attachment'  # redundant?


# msg.add_attachment(suben, 'RFC822', 'inline')
# msg.add_attachment(subes, 'RFC822', 'inline')

msg.attach(text.MIMEText('This is a plain text body.', 'plain'))
msg.attach(suben)
msg.attach(subes)
msg.replace_header('Content-type', 'multipart/alternative')

print(msg)

app = init_app(DevelopmentBuiltConfig)
with app.app_context():
    from server.emails.email_sender import EmailSender

    emailer = EmailSender()
    emailer._server.send_message(msg)
