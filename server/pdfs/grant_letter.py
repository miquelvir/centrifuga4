from datetime import datetime

from server.models import Student
from server.schemas.schemas import CourseSchema
from server.pdfs.html_to_pdf import create_pdf, find_unicode_font_path, output_pdf_bytes


def generate_grant_letter_pdf(
    student_id, backend_server_address, templates_folder=None
):
    student = Student.query.filter(Student.id == student_id).one_or_none()
    if not student:
        raise ValueError("student %s not found" % student_id)

    total_price = sum([c.price_term if c.price_term else 0 for c in student.courses])
    grant = (
        total_price > student.price_term
        if student.price_term is not None
        else None
    )
    grant_percentage = (
        round((total_price - student.price_term) / total_price * 100, 2)
        if total_price != 0
        else 0
        if student.price_term
        else None
    )
    cs = CourseSchema()
    return build_grant_letter_pdf(
        student_name=student.full_name.title(),
        courses=[cs.dump(c) for c in student.courses],
        paid_price=student.price_term,
        anual_paid_price=student.annual_price,
        total_price=total_price,
        grant=grant,
        grant_percentage=grant_percentage,
        datetime_value=datetime.date(datetime.now()),
    )


def build_grant_letter_pdf(
    student_name,
    courses,
    paid_price,
    anual_paid_price,
    total_price,
    grant,
    grant_percentage,
    datetime_value,
):
    pdf = create_pdf(find_unicode_font_path())

    pdf.set_font("DejaVu", size=8)
    pdf.multi_cell(
        0,
        4,
        "Xamfrà | C. de les Tàpies, 9, 08001 Barcelona | xamfra@xamfra.net | (+34) 934 439 151",
    )
    pdf.multi_cell(0, 4, "L'ARC TALLER DE MÚSICA, FUNDACIÓ PRIVADA")
    pdf.ln(8)

    pdf.set_font("DejaVu", "B", 14)
    pdf.cell(0, 10, "Informació econòmica sobre els tallers de Xamfrà", ln=1, align="C")
    pdf.ln(6)

    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(
        0,
        6,
        f"Benvolguts/udes,\n\nAquest curs, {student_name} s'ha matriculat als següents tallers de Xamfrà:",
    )
    for course in courses:
        course_line = f"+ {course.get('name', '-') }"
        if course.get("description"):
            course_line += f" ({course.get('description')})"
        pdf.multi_cell(0, 6, course_line)
    pdf.ln(3)

    grant_text = (
        f"La vostra aportació trimestral és de {paid_price}€, que pels tres trimestres fa un total de {anual_paid_price}€ per curs. "
        f"El cost real dels tallers seleccionats és de {total_price}€ trimestrals, "
    )
    if grant:
        grant_text += (
            f"per tant, Xamfrà es fa càrrec de cobrir el {grant_percentage}% de l'import. Això és possible gràcies a la "
            "aportació de la Fundació L'ARC Música, de les aportacions de particulars a través de la Campanya "
            "Amics de Xamfrà i de la Campanya de Teaming, d'aportacions extres que fan algunes famílies de Xamfrà i de la "
            "cerca de recursos públics i privats que realitza l'equip de Xamfrà per tal de garantir l'accés universal a la pràctica artística."
        )
    else:
        grant_text += (
            "us agraïm de tot cor el suport. La vostra ajuda permet garantir l'accés universal a la pràctica artística."
        )

    pdf.multi_cell(0, 6, grant_text)
    pdf.ln(8)
    pdf.multi_cell(0, 6, "Salutacions cordials,\nl'equip de Xamfrà")
    pdf.ln(4)
    pdf.multi_cell(0, 6, f"Barcelona, {datetime_value}")

    pdf.add_page()
    pdf.set_font("DejaVu", size=8)
    pdf.multi_cell(
        0,
        4,
        "Xamfrà | C. de les Tàpies, 9, 08001 Barcelona | xamfra@xamfra.net | (+34) 934 439 151",
    )
    pdf.multi_cell(0, 4, "L'ARC TALLER DE MÚSICA, FUNDACIÓ PRIVADA")
    pdf.ln(8)

    pdf.set_font("DejaVu", "B", 14)
    pdf.cell(0, 10, "Información económica sobre los talleres de Xamfrà", ln=1, align="C")
    pdf.ln(6)

    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(
        0,
        6,
        f"Estimados/as,\n\nEste curso, {student_name} se ha matriculado a los siguientes talleres de Xamfrà:",
    )
    for course in courses:
        course_line = f"+ {course.get('name', '-') }"
        if course.get("description"):
            course_line += f" ({course.get('description')})"
        pdf.multi_cell(0, 6, course_line)
    pdf.ln(3)

    grant_text = (
        f"Vuestra aportación trimestral es de {paid_price}€, que por los tres trimestres hace un total de {anual_paid_price}€ por curso. "
        f"El coste real de los talleres seleccionados es de {total_price}€ trimestrales, "
    )
    if grant:
        grant_text += (
            f"por tanto, Xamfrà se hace cargo de cubrir el {grant_percentage}% del importe. Dicha ayuda es posible gracias a la "
            "aportación de la Fundación L'ARC Música, de las cuotas de la Campaña de Amigos de Xamfrà y de la "
            "Campaña de Teaming, de las aportaciones extras de algunas familias de Xamfrà y de la búsqueda de recursos públicos "
            "y privados que realiza el equipo de Xamfrà para garantizar el acceso universal a la práctica artística."
        )
    else:
        grant_text += (
            "les agradecemos de todo corazón su soporte. Su ayuda permite garantizar el acceso universal a la práctica artística."
        )

    pdf.multi_cell(0, 6, grant_text)
    pdf.ln(8)
    pdf.multi_cell(0, 6, "Saludos cordiales,\nel equipo de Xamfrà")
    pdf.ln(4)
    pdf.multi_cell(0, 6, f"Barcelona, {datetime_value}")

    return output_pdf_bytes(pdf)
