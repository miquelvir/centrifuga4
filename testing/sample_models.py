from centrifuga4.models import User, Student, Course, Teacher
from passlib.apps import custom_app_context as pwd_context


def powerful_bob():
    return User(id="6f82c87e-b8a5-47de-ba66-759c9f9401da",
                name="bob",
                surname1="stuart",
                surname2="mill",
                email="bob12@gmail.com",
                phone="932014503",
                address="av. diagonal, 24",
                zip="08019",
                city="Barcelona",
                dni="23104523L",
                gender="male",
                birth_date="18/11/2000",
                country_of_origin="spain",
                username="admin",
                password_hash=pwd_context.hash("secretPower"),
                privilege_read=True,
                privilege_edit=True,
                privilege_create=True,
                privilege_delete=True,
                privilege_send=True,
                privilege_users=True), "secretPower"


def reader_anne():
    return User(id="13efe66b-4c0c-4ac3-a036-397994acd519",
                name="anne",
                surname1="mathias",
                surname2="aria",
                email="annem32@u23.me",
                phone="932012103",
                address="av. diagonal, 23",
                zip="01020",
                city="Madrid",
                dni="23104413L",
                gender="non-binary",
                birth_date="31/1/2000",
                country_of_origin="france",
                username="anny24",
                password_hash=pwd_context.hash("secretReader"),
                privilege_read=True), "secretReader"


def creator_john():
    return User(id="13efe66b-4c0c-4ac3-a036-397994acd519",
                name="john",
                surname1="lucas",
                surname2="mathew",
                email="johnyl@gmail.com",
                phone="932111103",
                address="f. macià, 23",
                zip="08020",
                city="Barcelona",
                dni="23304413L",
                gender="female",
                birth_date="29/2/2000",
                country_of_origin="spain",
                username="john33",
                password_hash=pwd_context.hash("secretCreator"),
                privilege_create=True), "secretCreator"


def editor_ezequiel():
    return User(id="b4c06ee0-79b1-4073-be5a-1a668027d985",
                name="ezequiel",
                surname1="more",
                surname2="stuart",
                email="ezi@gmail.com",
                phone="932121103",
                address="f. macià, 21",
                zip="09020",
                city="Terrassa",
                dni="23304433L",
                gender="male",
                birth_date="29/2/2009",
                country_of_origin="uk",
                username="ezequiel",
                password_hash=pwd_context.hash("secretEditor"),
                privilege_edit=True), "secretEditor"


def deleter_mer():
    return User(id="cd177dba-77df-4205-b63f-df06e0352626",
                name="mer",
                surname1="green",
                surname2="mill",
                email="mer@gmail.com",
                phone="932121113",
                address="av. macià, 21",
                zip="09021",
                city="Badalona",
                dni="23304433K",
                gender="female",
                birth_date="12/2/1999",
                country_of_origin="spain",
                username="mery23",
                password_hash=pwd_context.hash("secretDeleter"),
                privilege_delete=True), "secretDeleter"


def secretary_lucas():
    return User(id="540626a9-591f-42f5-8434-42c1e7590377",
                name="lucas",
                surname1="lithium",
                surname2="ore",
                email="lucasito@gmail.com",
                phone="932122223",
                address="av. tarragona, 21",
                zip="09024",
                city="Girona",
                dni="23311133K",
                gender="male",
                birth_date="28/11/1999",
                country_of_origin="spain",
                username="lucas66",
                password_hash=pwd_context.hash("secretSecretary"),
                privilege_delete=True,
                privilege_send=True,
                privilege_read=True,
                privilege_edit=True,
                privilege_create=True), "secretSecretary"


def guardian_mary():
    return Student(id="b45b8930-cd13-4e55-9f51-e09f66bb80fc",
                   name="mary",
                   surname1="li",
                   surname2="van goh",
                   email="marylili@gmail.com",
                   phone="912222213",
                   address="av. madrid, 11",
                   zip="09111",
                   city="Madrid",
                   dni="23311133P",
                   gender="female",
                   birth_date="14/12/1987",
                   country_of_origin="italia",
                   relation="mother")


def guardian_paul():
    return Student(id="d4cabb71-e467-43e4-9849-68c86032d6af",
                   name="paul",
                   surname1="gio",
                   surname2="go",
                   email="paulpaul@gmail.com",
                   phone="932051206",
                   address="av. palamós, 11",
                   zip="08018",
                   city="Barcelona",
                   dni="23311133Q",
                   gender="male",
                   birth_date="1/1/1987",
                   country_of_origin="greece",
                   relation="father")


def course_clarinet():
    return Course(id="d1db7ed7-2e6d-4451-83eb-855b650131c8",
                  name="clarinet 101")


def course_piano():
    return Course(id="9e045df3-91eb-4ac6-b191-0026c7e066e6",
                  name="piano 101")


def teacher_ester():
    return Teacher(id="e4acbe5b-289b-4e9e-9f3f-fe17cb4cbaac",
                   name="ester",
                   surname1="bonal",
                   surname2="penyagut",
                   email="ebonal@gmail.com",
                   phone="932111213",
                   address="av. tarradelles, 11",
                   zip="09024",
                   city="Barcelona",
                   dni="22211133M",
                   gender="female",
                   birth_date="21/01/1987",
                   country_of_origin="germany")


def teacher_paco():
    return Teacher(id="7a346115-7994-4d16-9382-287e735c2fd3",
                   name="paco",
                   surname1="vidal",
                   surname2="francesc",
                   email="fvidal@gmail.com",
                   phone="932119213",
                   address="av. corachán, 11",
                   zip="09026",
                   city="Lleida",
                   dni="22211193M",
                   gender="male",
                   birth_date="1/01/1989",
                   country_of_origin="spain")


def student_nerea():
    return Student(id="117b4e24-9523-42a3-b5e2-bacf1b292fef",
                   name="nerea",
                   surname1="sastrum",
                   surname2="ferny",
                   email="nereasio@gmail.com",
                   phone="932122213",
                   address="av. girona, 11",
                   zip="09014",
                   city="Barcelona",
                   dni="23311133M",
                   gender="female",
                   birth_date="28/12/1987",
                   country_of_origin="spain")
