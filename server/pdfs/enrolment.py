from datetime import datetime

from server.models import Student
from server.schemas.schemas import CourseSchema, GuardianSchema, StudentSchema
from server.pdfs.html_to_pdf import create_pdf, find_unicode_font_path, output_pdf_bytes


def generate_enrolment_agreement_pdf(
    student_id, backend_server_address, templates_folder=None
):
    student = Student.query.filter(Student.id == student_id).one_or_none()
    if not student:
        return

    total_price = sum([c.price_term for c in student.courses])
    grant = (
        total_price > student.price_term
        if student.price_term is not None
        else None
    )
    grant_percentage = (
        round(student.price_term / total_price * 100, 2)
        if total_price != 0
        else 0
        if student.price_term
        else None
    )

    cs = CourseSchema()
    gs = GuardianSchema()
    return build_enrolment_agreement_pdf(
        student_name=student.full_name.title(),
        courses=[cs.dump(c) for c in student.courses],
        paid_price=student.price_term,
        anual_paid_price=student.annual_price,
        total_price=total_price,
        grant=grant,
        grant_percentage=grant_percentage,
        datetime_value=datetime.date(datetime.now()),
        student=StudentSchema().dump(student),
        guardians=[gs.dump(g) for g in student.guardians],
        schedules=student.get_course_schedules(),
    )


def build_enrolment_agreement_pdf(
    student_name,
    courses,
    paid_price,
    anual_paid_price,
    total_price,
    grant,
    grant_percentage,
    datetime_value,
    student,
    guardians,
    schedules,
):
    pdf = create_pdf(find_unicode_font_path())

    pdf.set_font("DejaVu", size=8)
    pdf.multi_cell(
        0,
        4,
        "Xamfrà | C. de les Tàpies, 9, 08001 Barcelona | xamfra@xamfra.net | (+34) 934 439 151",
    )
    pdf.multi_cell(0, 4, "L'ARC TALLER DE MÚSICA, FUNDACIÓ PRIVADA")
    pdf.ln(4)

    pdf.set_font("DejaVu", "B", 14)
    pdf.cell(0, 10, "MATRÍCULA | ENROLMENT", ln=1, align="C")
    pdf.ln(2)

    pdf.set_font("DejaVu", "B", 11)
    pdf.multi_cell(
        0,
        6,
        "DADES DE L'ALUMNE/A | DATOS DEL ALUMNO/A | STUDENT'S DATA",
    )
    pdf.ln(1)

    pdf.set_font("DejaVu", size=10)
    for label, value in [
        ("nom / nombre / name", student.get("name")),
        ("primer cognom / primer apellido / first surname", student.get("surname1")),
        ("segon cognom / segundo apellido / second surname", student.get("surname2")),
        ("n. expedient / nº expediente / student id", student.get("id")),
        ("data de naixement / fecha de nacimiento / birth date", student.get("birth_date")),
        ("adreça / dirección / address", student.get("address")),
        ("codi postal / código postal / ZIP", student.get("zip")),
        ("ciutat / ciudad / city", student.get("city")),
        ("correu de l'estudiant / correo del estudiante / student's email", student.get("email")),
        ("telèfon de l'estudiant / teléfono del estudiante / student's phone", student.get("phone")),
    ]:
        pdf.set_font("DejaVu", "B", 10)
        pdf.multi_cell(0, 5, label)
        pdf.set_font("DejaVu", size=10)
        pdf.multi_cell(0, 5, str(value or "-"))
        pdf.ln(1)

    if guardians:
        pdf.ln(2)
        for guardian in guardians:
            if guardian.get("email"):
                pdf.set_font("DejaVu", "B", 10)
                pdf.multi_cell(0, 5, "correu de contacte / correo de contacto / contact email")
                pdf.set_font("DejaVu", size=10)
                pdf.multi_cell(0, 5, guardian.get("email", "-"))
                pdf.ln(1)
            if guardian.get("phone"):
                pdf.set_font("DejaVu", "B", 10)
                pdf.multi_cell(0, 5, "telèfon de contacte / teléfono de contacto / contact phone")
                pdf.set_font("DejaVu", size=10)
                pdf.multi_cell(0, 5, guardian.get("phone", "-"))
                pdf.ln(1)

    pdf.ln(3)
    pdf.set_font("DejaVu", "B", 11)
    pdf.multi_cell(
        0,
        6,
        "CURSOS I TALLERS | CURSOS Y TALLERES | COURSES & WORKSHOPS",
    )
    pdf.ln(1)

    pdf.set_font("DejaVu", size=10)
    for course in courses:
        pdf.set_font("DejaVu", "B", 10)
        pdf.multi_cell(0, 6, course.get("name", "-"))
        pdf.set_font("DejaVu", size=10)
        if course.get("description"):
            pdf.multi_cell(0, 5, course.get("description"))
        if course.get("id") in schedules:
            pdf.multi_cell(0, 5, "horari / horario / schedule")
            for schedule in schedules.get(course.get("id"), []):
                pdf.multi_cell(0, 5, schedule)
        pdf.ln(1)

    pdf.ln(3)
    pdf.set_font("DejaVu", "B", 11)
    pdf.multi_cell(0, 6, "PAGAMENT | PAGO | PAYMENT")
    pdf.ln(1)

    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(
        0,
        5,
        "forma de pagament per defecte / forma de pago preferida / default payment method",
    )
    pdf.multi_cell(
        0,
        5,
        str(student.get("default_payment_method") or "-"),
    )
    pdf.ln(1)
    pdf.multi_cell(
        0,
        5,
        "periodicitat / periodicidad / periodicity",
    )
    pdf.multi_cell(
        0,
        5,
        "trimestral (3 per curs) / trimestral (3 por curso) / quarterly (3 per school year)",
    )
    pdf.ln(3)

    pdf.set_line_width(0.2)
    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(120, 8, "preu base trimestral / precio base trimestral / base price per term", border=1)
    pdf.set_font("DejaVu", size=10)
    pdf.cell(60, 8, f"{total_price}€ (EUR)", border=1, ln=1)
    if grant:
        pdf.set_font("DejaVu", "B", 10)
        pdf.cell(120, 8, "beca Xamfrà / beca Xamfrà / Xamfrà's grant", border=1)
        pdf.set_font("DejaVu", size=10)
        pdf.cell(60, 8, f"- {total_price - paid_price}€ (EUR)", border=1, ln=1)
    else:
        pdf.set_font("DejaVu", "B", 10)
        pdf.cell(120, 8, "aportació / aportación / donation", border=1)
        pdf.set_font("DejaVu", size=10)
        pdf.cell(60, 8, f"+ {paid_price - total_price}€ (EUR)", border=1, ln=1)
    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(120, 8, "preu trimestral / precio trimestral / price per term", border=1)
    pdf.set_font("DejaVu", size=10)
    pdf.cell(60, 8, f"{paid_price}€ (EUR)", border=1, ln=1)

    pdf.ln(5)
    pdf.set_font("DejaVu", size=10)

    if student.get("age") is None or student.get("age", 0) < 18:
        _write_checkbox_line(
            pdf,
            True,
            "Autoritzo l’ús del número de telèfon i adreça de correu electrònic de l'estudiant, menor d’edat, únicament i exclusiva per a finalitats derivades de l’activitat de Xamfrà.",
        )

    _write_checkbox_line(
        pdf,
        bool(student.get("image_agreement")),
        "Autoritzo l’ús de la meva imatge i/o la dels meus fills/es matriculats per a que pugui aparèixer a materials escrits o multimèdia corresponents a activitats educatives organitzades per Xamfrà.",
    )
    _write_checkbox_line(
        pdf,
        bool(student.get("image_agreement_external")),
        "Autoritzo l’ús de la meva imatge i/o la dels meus fills/es matriculats per a que puguin aparèixer a materials escrits o multimèdia corresponents a activitats organitzades per terceres persones autoritzades per L’ARC Música.",
    )
    _write_checkbox_line(
        pdf,
        True,
        "En qualsevol cas, em comprometo a fer un ús responsable de les imatges obtingudes per mitjans propis de la participació d’alumnes de l’escola a activitats promogudes per aquesta.",
    )
    _write_checkbox_line(
        pdf,
        True,
        "Autoritzo l’ús de les dades de contacte proporcionades únicament i exclusiva per a finalitats derivades de o relacionades amb l’activitat de Xamfrà.",
    )
    _write_checkbox_line(
        pdf,
        True,
        "He estat informat de la següent política de tractament de dades. El Responsable del Tractament és Xamfrà. La finalitat del tractament és gestionar la teva vinculació amb Xamfrà.",
    )
    _write_checkbox_line(
        pdf,
        True,
        "Declaro que les dades que faig constar en aquest document són certes.",
    )

    pdf.ln(5)
    pdf.multi_cell(0, 6, "____/____/________ [DD/MM/YYYY], Barcelona")
    pdf.ln(8)
    pdf.multi_cell(
        0,
        6,
        "signatura / firma / signature, (nom / nombre / name, cognoms / apellidos / surnames, DNI / DNI / ID)",
    )
    pdf.ln(3)
    if student.get("is_underage"):
        pdf.multi_cell(0, 6, "[alumne / alumno / student]")
    else:
        pdf.multi_cell(0, 6, "[pare, mare o tutor legal / padre, madre o tutor legal / father, mother or legal guardian]")

    return output_pdf_bytes(pdf)


def _write_checkbox_line(pdf, checked, label):
    marker = "☑" if checked else "☐"
    pdf.multi_cell(0, 5, f"{marker} {label}")
