import sqlite3
from os.path import join, dirname
from dotenv import load_dotenv

from manual_db_utils.generate_sample_db import add_needs, add_labels, add_users

load_dotenv(join(dirname(__file__), "../.env"))


import datetime

import centrifuga4
from centrifuga4.models import Student, Guardian, Payment, Course, Label, Schedule, User


def create_connection(db_file):
    """create a database connection to the SQLite database
        specified by the db_file
    :param db_file: database file
    :return: Connection object or None
    """
    return sqlite3.connect(db_file)


def n(v):
    return v if v != "" else None


def get_guardians(conn, old_id):
    guardians = []
    cur = conn.cursor()
    cur.execute("SELECT * FROM CONTACTS WHERE student_id='%s'" % old_id)
    rows = cur.fetchall()
    for row in rows:
        guardians.append(
            Guardian(
                id=Guardian.generate_new_id(),
                name=row[2],
                surname1=n(row[3]),
                surname2=n(row[4]),
                email=n(row[5]),
                phone=n(row[6]),
                address=n(row[7]),
                zip=n(row[8]),
                city=n(row[9]),
                dni=n(row[10]),
                gender="m" if row[11] == "noi" else "f" if row[11] == "noia" else None,
                is_working=True,
                is_studying=False,
                career=n(row[12]),
                country_of_origin=row[14],
                relation=n("other"),  # todo row 15
            )
        )
    return guardians


def get_payments(conn, old_id, method):
    payments = []
    cur = conn.cursor()
    cur.execute("SELECT * FROM PAYMENTS WHERE student_id='%s'" % old_id)
    rows = cur.fetchall()
    for row in rows:
        payments.append(
            Payment(
                id=Payment.generate_new_id(),
                quantity=float(row[3]),
                method=method,
                date=datetime.datetime.strptime(row[2], "%Y-%m-%d").date(),
            )
        )
    return payments


def education_year(raw):
    if raw == "P1":
        return "kindergarten_p1"
    if raw == "P2":
        return "kindergarten_p2"
    if raw == "P3":
        return "kindergarten_p3"
    if raw == "P4":
        return "kindergarten_p4"
    if raw == "P5":
        return "kindergarten_p5"
    if raw == "1r Primària":
        return "primary_1"
    if raw == "2n Primària":
        return "primary_2"
    if raw == "3r Primària":
        return "primary_3"
    if raw == "4t Primària":
        return "primary_4"
    if raw == "5è Primària":
        return "primary_5"
    if raw == "6è Primària":
        return "primary_6"
    if raw == "1r ESO":
        return "eso_1"
    if raw == "2n ESO":
        return "eso_2"
    if raw == "3r ESO":
        return "eso_3"
    if raw == "4t ESO":
        return "eso_4"
    if raw == "Batxillerat o Cicle":
        return "baccalaureate_1"
    if raw == "Altres":
        return "other"


def get_students(conn, course_ids):
    cur = conn.cursor()
    cur.execute("SELECT * FROM STUDENTS")
    rows = cur.fetchall()
    students = []
    ids = {}
    for row in rows:
        print("reading student")
        cur.execute("SELECT * FROM ATTENDEES WHERE student_id='%s'" % row[0])
        a = cur.fetchone()
        new_id = Student.generate_new_id()
        old_id = row[0]
        ids[row[0]] = new_id
        s = Student(
            id=new_id,  # todo standarize
            enrolment_status="enrolled"
            if bool(row[1])
            else "early-unenrolled"
            if bool(row[2])
            else "pre-enrolled",
            years_in_xamfra=int(row[3]),
            payment_comments=n(row[4]),
            price_term=float(row[5]),
            default_payment_method="cash" if bool(row[6]) else "bank-transfer",
            other_comments=n(row[7]),
            name=a[2],
            surname1=n(a[3]),
            surname2=n(a[4]),
            email=n(a[5]),
            phone=n(a[6]),
            address=n(a[7]),
            zip=n(a[8]),
            city=n(a[9]),
            dni=n(a[10]),
            gender=n("m" if a[11] == "noi" else "f" if a[11] == "noia" else "nb"),
            education_entity=n(a[12]),
            is_studying=True,
            is_working=False,
            education_year=education_year(a[13]),
            birth_date=datetime.datetime.strptime(a[15], "%Y-%m-%d").date()
            if n(a[15])
            else None,
            country_of_origin=country_to_code(n(a[16])) if n(a[16]) else None,
        )

        for g in get_guardians(conn, old_id):
            s.guardians.append(g)
        for p in get_payments(
            conn, old_id, "cash" if bool(row[6]) else "bank-transfer"
        ):
            s.payments.append(p)

        cur.execute("SELECT * FROM STUDENT_CLASS WHERE student_id='%s'" % row[0])
        cs = cur.fetchall()
        for c in cs:
            try:
                c = Course.query.filter(Course.id == course_ids[c[1]]).first()
                print("course found", c)
                if c:
                    s.courses.append(c)
            except KeyError:
                pass

        students.append(s)
    return students, ids


def get_courses(conn):
    cur = conn.cursor()
    cur.execute("SELECT * FROM CLASSES")
    rows = cur.fetchall()
    courses = []
    ids = {}
    for row in rows:
        print("reading student")

        old_id = row[0]

        s = Course(
            id=Course.generate_new_id(),
            name=row[1],
            price_term=float(row[3]),
            calendar_id=Course.generate_new_id(),
        )

        ids[old_id] = s.id

        if row[2] == "adults":
            s.labels.append(Label.query.filter(Label.id == "adult").first())
        if row[2] == "tallers per joves":
            s.labels.append(Label.query.filter(Label.id == "eso_3").first())
            s.labels.append(Label.query.filter(Label.id == "eso_4").first())
            s.labels.append(Label.query.filter(Label.id == "baccalaureate_1").first())
            s.labels.append(Label.query.filter(Label.id == "baccalaureate_2").first())
            s.labels.append(Label.query.filter(Label.id == "FP_lower").first())
            s.labels.append(Label.query.filter(Label.id == "FP_higher").first())
            s.labels.append(Label.query.filter(Label.id == "FP_higher").first())
            s.labels.append(Label.query.filter(Label.id == "undergraduate").first())
        if row[2] == "1r i 2n de primària":
            s.labels.append(Label.query.filter(Label.id == "primary_1").first())
            s.labels.append(Label.query.filter(Label.id == "primary_2").first())
        if row[2] == "1r i 2n de d'eso":
            s.labels.append(Label.query.filter(Label.id == "eso_1").first())
            s.labels.append(Label.query.filter(Label.id == "eso_2").first())
        if row[2] == "3r-4t-5è-6è primària":
            s.labels.append(Label.query.filter(Label.id == "primary_3").first())
            s.labels.append(Label.query.filter(Label.id == "primary_4").first())
            s.labels.append(Label.query.filter(Label.id == "primary_5").first())
            s.labels.append(Label.query.filter(Label.id == "primary_6").first())
        if row[2] == "p3":
            s.labels.append(Label.query.filter(Label.id == "kindergarten_p3").first())
        if row[2] == "p2":
            s.labels.append(Label.query.filter(Label.id == "kindergarten_p2").first())
        if row[2] == "p1":
            s.labels.append(Label.query.filter(Label.id == "kindergarten_p1").first())

        courses.append(s)
    return courses, ids


def get_schedules(conn, student_ids, course_ids):
    cur = conn.cursor()
    cur.execute("SELECT * FROM CLASS_SCHEDULES")
    rows = cur.fetchall()
    schedules = []
    for row in rows:

        day_week = int(row[3]) + 1
        if day_week > 6:
            day_week = 0

        s = Schedule(
            id=Schedule.generate_new_id(),
            course_id=course_ids[row[1]],
            student_id=student_ids[row[2]] if row[2] else None,
            day_week=day_week,
            start_time=datetime.datetime.strptime(row[4], "%H:%M").time(),
            end_time=datetime.datetime.strptime(row[6], "%H:%M").time(),
        )

        schedules.append(s)
    return schedules


def country_to_code(country):
    CODES = {
        "altres": "other",
        "afganistan": "af",
        "aland": "ax",
        "albània": "al",
        "alemanya": "de",
        "algèria": "dz",
        "andorra": "ad",
        "angola": "ao",
        "anguilla": "ai",
        "antàrtida": "aq",
        "antigua i barbuda": "ag",
        "aràbia saudí": "sa",
        "argentina": "ar",
        "armènia": "am",
        "aruba": "aw",
        "austràlia": "au",
        "àustria": "at",
        "azerbaidjan": "az",
        '"bahames': "bs",
        "bahrain": "bh",
        "bangladesh": "bd",
        "barbados": "bb",
        "belarús": "by",
        "bèlgica": "be",
        "belize": "bz",
        "benín": "bj",
        "bermudes": "bm",
        "bhutan": "bt",
        "bolívia": "bo",
        '"bonaire': "bq",
        "bòsnia i hercegovina": "ba",
        "botswana": "bw",
        "brasil": "br",
        "brunei": "bn",
        "bulgària": "bg",
        "burkina faso": "bf",
        "burundi": "bi",
        "cambodja": "kh",
        "camerun": "cm",
        "canadà": "ca",
        "cap verd": "cv",
        "colòmbia": "co",
        '"comores': "km",
        "congo": "cg",
        "corea del nord": "kp",
        "corea del sud": "kr",
        "costa d'ivori": "ci",
        "costa rica": "cr",
        "croàcia": "hr",
        "cuba": "cu",
        "curaçao": "cw",
        "dinamarca": "dk",
        "djibouti": "dj",
        "dominica": "dm",
        "egipte": "eg",
        "el salvador": "sv",
        '"emirats àrabs units': "ae",
        "equador": "ec",
        "eritrea": "er",
        "eslovàquia": "sk",
        "eslovènia": "si",
        "espanya": "es",
        "estats units": "us",
        "estònia": "ee",
        "eswatini": "sz",
        "etiòpia": "et",
        "fèroe": "fo",
        "fiji": "fj",
        "filipines": "ph",
        "finlàndia": "fi",
        "frança": "fr",
        "gabon": "ga",
        "gàmbia": "gm",
        "geòrgia": "ge",
        "ghana": "gh",
        "gibraltar": "gi",
        "grècia": "gr",
        "grenada": "gd",
        "groenlàndia": "gl",
        "guadalupe": "gp",
        "guaiana francesa": "gf",
        "guam": "gu",
        "guatemala": "gt",
        "guernsey": "gg",
        "guinea": "gn",
        "guinea equatorial": "gq",
        "guinea-bissau": "gw",
        "guyana": "gy",
        "haití": "ht",
        "hondures": "hn",
        '"hong kong': "hk",
        "hongria": "hu",
        '"iemen': "ye",
        "illa bouvet": "bv",
        "illa christmas": "cx",
        "illa de man": "im",
        "illa norfolk": "nf",
        "illes caiman": "ky",
        "illes cocos (keeling)": "cc",
        "illes cook": "ck",
        "illes falkland (malvines)": "fk",
        "illes geòrgia del sud i sandwich del sud": "gs",
        "illes heard i mcdonald": "hm",
        "illes marianes del nord": "mp",
        "illes marshall": "mh",
        "illes menors allunyades dels estats units": "um",
        "illes salomó": "sb",
        "illes turks i caicos": "tc",
        "illes verges britàniques": "vg",
        "illes verges dels estats units": "vi",
        "índia": "in",
        "indonèsia": "id",
        "iran": "ir",
        '"iraq': "iq",
        "irlanda": "ie",
        "islàndia": "is",
        "israel": "il",
        "itàlia": "it",
        "jamaica": "jm",
        "japó": "jp",
        "jersey": "je",
        "jordània": "jo",
        "kazakhstan": "kz",
        "kenya": "ke",
        "kirguizstan": "kg",
        "kiribati": "ki",
        "kuwait": "kw",
        "lao": "la",
        "lesotho": "ls",
        "letònia": "lv",
        "líban": "lb",
        "libèria": "lr",
        "líbia": "ly",
        "liechtenstein": "li",
        "lituània": "lt",
        "luxemburg": "lu",
        '"macao': "mo",
        "macedònia del nord": "mk",
        "madagascar": "mg",
        "malàisia": "my",
        "malawi": "mw",
        "maldives": "mv",
        "mali": "ml",
        "malta": "mt",
        "marroc": "ma",
        "martinica": "mq",
        "maurici": "mu",
        "mauritània": "mr",
        "mayotte": "yt",
        "mèxic": "mx",
        "micronèsia": "fm",
        "moçambic": "mz",
        "moldàvia": "md",
        "mònaco": "mc",
        "mongòlia": "mn",
        "montenegro": "me",
        "montserrat": "ms",
        "myanmar": "mm",
        "namíbia": "na",
        "nauru": "nr",
        "nepal": "np",
        "nicaragua": "ni",
        "níger": "ne",
        "nigèria": "ng",
        "niue": "nu",
        "noruega": "no",
        "nova caledònia": "nc",
        "nova zelanda": "nz",
        "oman": "om",
        "països baixos": "nl",
        "pakistan": "pk",
        "palau": "pw",
        "palestina": "ps",
        "panamà": "pa",
        "papua nova guinea": "pg",
        "paraguai": "py",
        "perú": "pe",
        "pitcairn": "pn",
        "polinèsia francesa": "pf",
        "polònia": "pl",
        "portugal": "pt",
        "puerto rico": "pr",
        "qatar": "qa",
        "regne unit": "gb",
        "república centreafricana": "cf",
        "república democràtica del congo": "cd",
        "república dominicana": "do",
        '"reunió': "re",
        "romania": "ro",
        "ruanda": "rw",
        "rússia": "ru",
        "sàhara occidental": "eh",
        '"saint helena': "sh",
        "saint kitts i nevis": "kn",
        "saint lucia": "lc",
        "saint vincent i les grenadines": "vc",
        "saint-barthélemy": "bl",
        "saint-martin": "mf",
        "saint-pierre-et-miquelon": "pm",
        "samoa": "ws",
        "samoa americana": "as",
        "san marino": "sm",
        "santa seu": "va",
        "são tomé i príncipe": "st",
        "senegal": "sn",
        "sèrbia": "rs",
        "seychelles": "sc",
        "sierra leone": "sl",
        "singapur": "sg",
        "sint maarten": "sx",
        "síria": "sy",
        "somàlia": "so",
        "sri lanka": "lk",
        "sud-àfrica": "za",
        '"sudan del sud': "ss",
        '"sudan': "sd",
        "suècia": "se",
        "suïssa": "ch",
        "surinam": "sr",
        "svalbard i jan mayen": "sj",
        "tadjikistan": "tj",
        "tailàndia": "th",
        "taiwan": "tw",
        "tanzània": "tz",
        "terres australs i antàrtiques franceses": "tf",
        "territori britànic de l'oceà índic": "io",
        "timor-leste": "tl",
        "togo": "tg",
        "tokelau": "tk",
        "tonga": "to",
        "trinidad i tobago": "tt",
        "tunísia": "tn",
        "turkmenistan": "tm",
        "turquia": "tr",
        "tuvalu": "tv",
        "txad": "td",
        "txèquia": "cz",
        "ucraïna": "ua",
        "uganda": "ug",
        "uruguai": "uy",
        "uzbekistan": "uz",
        "vanuatu": "vu",
        "veneçuela": "ve",
        "vietnam": "vn",
        "wallis i futuna": "wf",
        "xile": "cl",
        "xina": "cn",
        "xipre": "cy",
        "zàmbia": "zm",
        "zimbàbue": "zw",
    }
    return CODES[country]


def migrate_all(path):
    print("dropping... [1]")
    centrifuga4.db.drop_all()  # drop previous schemas
    print("creating... [2]")
    centrifuga4.db.create_all()  # load new schemas
    print("migrating... [3]")

    conn = create_connection(path)

    add_needs()
    labels = add_labels()

    courses, ids = get_courses(conn)

    for course in courses:
        print("adding course")
        centrifuga4.db.session.add(course)
    students, ids2 = get_students(conn, ids)
    for student in students:
        print("adding student")
        centrifuga4.db.session.add(student)
    for schedule in get_schedules(conn, ids2, ids):
        print("adding schedule")
        centrifuga4.db.session.add(schedule)
    for course in courses:
        for schedule in course.schedules:
            if not schedule.is_base:
                for s2 in course.schedules:
                    if s2.is_base:
                        s2: Schedule
                        if (
                            s2.start_time == schedule.start_time
                            and s2.end_time == schedule.end_time
                            and s2.day_week == schedule.day_week
                        ):
                            centrifuga4.db.session.delete(schedule)

    print("adding users... [4]")

    print("comitting changes... [5]")
    centrifuga4.db.session.commit()


if __name__ == "__main__":  # /home/miquelvir/Downloads/studentsdata.db
    app = centrifuga4.init_app("config.DevelopmentConfig")
    with app.app_context():

        migrate_all("/home/miquelvir/Downloads/studentsdata.db")
