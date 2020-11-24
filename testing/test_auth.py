from base64 import b64encode
import centrifuga4
from centrifuga4.models import Student, Guardian, UserSchema
from centrifuga4.models import User
from .test_centrifuga4 import client
from passlib.apps import custom_app_context as pwd_context


def test_empty_db(client):
    """Start with a blank database."""

    u = User(id="admin", name="admin", username="admin", password_hash=pwd_context.hash("admin"), privilege_read=True)
    centrifuga4.db.session.add(u)

    s = Student(id="john", name="john")
    s.guardians.append(Guardian(id="ua81-john", name="ua81-john", relation="mother"))
    centrifuga4.db.session.add(s)

    centrifuga4.db.session.commit()


    credentials = b64encode(b"admin:admin").decode('utf-8')
    res = client.post('/auth/v1/token/generate', headers={"Authorization": f"Basic {credentials}"})
    print(res.get_data())
    csrf = res.get_json()
    tokens = {
        "X-CSRF-ACCESS-TOKEN": csrf["access_csrf"],
        "X-CSRF-REFRESH-TOKEN": csrf["refresh_csrf"]
    }
    print(tokens)
    res = client.get('/api/v1/student/john', headers=tokens)
    print(res.get_json())
    print(UserSchema().dump(s))
    assert res.get_json() == UserSchema().dump(s)
    assert res.status_code == 200
