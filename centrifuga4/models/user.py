from centrifuga4 import db
from centrifuga4.models.person import Person
from passlib.apps import custom_app_context as pwd_context


class User(Person):
    __tablename__ = "user"
    __mapper_args__ = {
        'polymorphic_identity': "user"
    }

    id = db.Column(db.Text, db.ForeignKey('person.id'), primary_key=True)
    username = db.Column(db.Text, unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    privilege_read = db.Column(db.Boolean, nullable=False, default=False)
    privilege_edit = db.Column(db.Boolean, nullable=False, default=False)
    privilege_create = db.Column(db.Boolean, nullable=False, default=False)
    privilege_delete = db.Column(db.Boolean, nullable=False, default=False)
    privilege_send = db.Column(db.Boolean, nullable=False, default=False)
    privilege_users = db.Column(db.Boolean, nullable=False, default=False)

    def login(self, password: str) -> bool:
        """ checks if password hash matches stored patch """
        return pwd_context.verify(password, self.password_hash)

    @property
    def privileges(self):
        privileges = []

        if self.privilege_read:
            privileges.append("read")

        if self.privilege_edit:
            privileges.append("edit")

        if self.privilege_create:
            privileges.append("create")

        if self.privilege_send:
            privileges.append("send")

        if self.privilege_delete:
            privileges.append("delete")

        if self.privilege_users:
            privileges.append("users")

        return privileges

    def get_claims(self):
        return {"privileges": self.privileges}
