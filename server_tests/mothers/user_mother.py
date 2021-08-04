from server.models import User


class UserMother:
    @staticmethod
    def simple(password="passwordPASSWORD_&%1",
               email="noreply@user.xamfra.net",
               id_="1",
               name="name",
               surname1="surname1",
               surname2="surname2") -> User:
        return User(id=id_,
                    name=name,
                    surname1=surname1,
                    surname2=surname2,
                    email=email,
                    password_hash=User.hash_password(password))
