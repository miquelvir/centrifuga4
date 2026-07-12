from datetime import datetime

import jwt

from server.pdfs.html_to_pdf import create_pdf, find_unicode_font_path, output_pdf_bytes


def generate_payment_recipe_pdf(
    secret, payment, student, backend_url, templates_folder=None
):
    def unix_time_millis():
        epoch = datetime.utcfromtimestamp(0)
        return int((datetime.now() - epoch).total_seconds() * 1000.0)

    signing_at = unix_time_millis()
    try:
        student_name = student["full_name"].title()
        student_id = student["id"]
    except (IndexError, KeyError):
        raise

    token = jwt.encode(
        {
            "studentId": student_id,
            "paymentId": payment["id"],
            "studentName": student_name,
            "paymentMethod": payment["method"],
            "paymentDate": str(payment["date"]),
            "paymentQuantity": "%s EUR" % payment["quantity"],
            "iat": signing_at,
        },
        secret,
        algorithm="HS256",
    )
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return build_payment_recipe_pdf(
        full_name=student_name,
        quantity=payment["quantity"],
        date_value=payment["date"],
        method=payment["method"],
        today=datetime.date(datetime.now()),
        today_extended=signing_at,
        payment_id=payment["id"],
        verification_link="%s/validation/v1/%s" % (backend_url, token),
    )


def build_payment_recipe_pdf(
    full_name,
    quantity,
    date_value,
    method,
    today,
    today_extended,
    payment_id,
    verification_link,
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

    pdf.set_font("DejaVu", "B", 12)
    pdf.cell(0, 8, "Payment receipt / Recibo de pago / Resguardo de pago", ln=1, align="C")
    pdf.ln(6)

    method_labels = {
        "bank-transfer": (
            "mitjançant una transferència bancària",
            "mediante una transferencia bancaria",
            "through a bank transfer",
        ),
        "cash": (
            "en efectiu",
            "en efectivo",
            "in cash",
        ),
        "card": (
            "amb targeta",
            "con tarjeta",
            "using a card",
        ),
        "bank-direct-debit": (
            "mitjançant la domiciliació bancària",
            "mediante la domiciliación bancaria",
            "through the direct debit payment",
        ),
    }
    cat_method, esp_method, eng_method = method_labels.get(
        method,
        (
            "amb un mètode de pagament no especificat",
            "mediante un método de pago no especificado",
            "through an unspecified payment method",
        ),
    )

    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(0, 6, "CAT", ln=1)
    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(
        0,
        6,
        (
            f"L'ARC TALLER DE MÚSICA, FUNDACIÓ PRIVADA ha rebut el pagament de l'estudiant '{full_name}', "
            f"de {quantity}€ (EUR) a data de {date_value} (" + cat_method + ")."
        ),
    )
    pdf.ln(4)

    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(0, 6, "ESP", ln=1)
    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(
        0,
        6,
        (
            f"L'ARC TALLER DE MÚSICA, FUNDACIÓ PRIVADA ha recibido el pago del estudiante '{full_name}', "
            f"de {quantity}€ (EUR) a fecha de {date_value} (" + esp_method + ")."
        ),
    )
    pdf.ln(4)

    pdf.set_font("DejaVu", "B", 10)
    pdf.cell(0, 6, "ENG", ln=1)
    pdf.set_font("DejaVu", size=10)
    pdf.multi_cell(
        0,
        6,
        (
            f"L'ARC TALLER DE MÚSICA, FUNDACIÓ PRIVADA has received the payment for student '{full_name}' "
            f"of {quantity}€ (EUR) on the following date: {date_value} (" + eng_method + ")."
        ),
    )
    pdf.ln(8)

    pdf.set_font("DejaVu", "B", 10)
    pdf.multi_cell(0, 6, f"id/ {payment_id}")
    pdf.multi_cell(0, 6, f"epoch/ {today_extended}")

    pdf.ln(6)
    pdf.multi_cell(0, 6, f"{today}, Barcelona")

    return output_pdf_bytes(pdf)
