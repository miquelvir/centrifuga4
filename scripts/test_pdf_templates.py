#!/usr/bin/env python3
import argparse
import pathlib
import sys
from datetime import date, datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from server.pdfs.enrolment import build_enrolment_agreement_pdf
from server.pdfs.grant_letter import build_grant_letter_pdf
from server.pdfs.payment_receipt import build_payment_recipe_pdf

OUTPUT_DIR = ROOT / "tmp" / "pdf_template_test"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def sample_enrolment_context():
    return {
        "student_name": "Maria Pérez",
        "courses": [
            {"id": "c1", "name": "Guitar Basics", "description": "Introductory course"},
            {"id": "c2", "name": "Jazz Ensemble", "description": "Weekly rehearsal"},
        ],
        "paid_price": 180,
        "anual_paid_price": 540,
        "total_price": 600,
        "grant": True,
        "grant_percentage": 70.0,
        "datetime_value": date.today(),
        "student": {
            "name": "Maria",
            "surname1": "Pérez",
            "surname2": "Gómez",
            "id": "SAMPLE-001",
            "birth_date": "2008-03-21",
            "address": "Carrer Major 12",
            "zip": "08001",
            "city": "Barcelona",
            "email": "maria@example.com",
            "phone": "+34 600 000 000",
            "default_payment_method": "bank-transfer",
            "age": 16,
            "is_underage": True,
            "image_agreement": True,
            "image_agreement_external": False,
        },
        "guardians": [
            {"email": "parent@example.com", "phone": "+34 600 111 111"}
        ],
        "schedules": {
            "c1": ["Mon 16:00-17:30", "Wed 16:00-17:30"],
            "c2": ["Fri 18:00-20:00"],
        },
    }


def sample_grant_letter_context():
    return {
        "student_name": "Maria Pérez",
        "courses": [
            {"id": "c1", "name": "Guitar Basics", "description": "Introductory course"},
            {"id": "c2", "name": "Jazz Ensemble", "description": "Weekly rehearsal"},
        ],
        "paid_price": 180,
        "anual_paid_price": 540,
        "total_price": 600,
        "grant": True,
        "grant_percentage": 70.0,
        "datetime_value": date.today(),
    }


def sample_payment_receipt_context():
    return {
        "full_name": "Maria Pérez",
        "quantity": 120,
        "date_value": date.today(),
        "method": "bank-transfer",
        "today": date.today(),
        "today_extended": int(datetime.utcnow().timestamp() * 1000),
        "payment_id": "PAYMENT-001",
        "verification_link": "https://localhost:5000/validation/v1/TESTTOKEN",
    }


def write_file(path: pathlib.Path, data, mode="wb"):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def main():
    tests = [
        ("enrolment", build_enrolment_agreement_pdf, sample_enrolment_context()),
        ("grant_letter", build_grant_letter_pdf, sample_grant_letter_context()),
        ("payment_receipt", build_payment_recipe_pdf, sample_payment_receipt_context()),
    ]

    for output_name, builder, context in tests:
        print(f"Generating {output_name} PDF")
        pdf_bytes = builder(**context)
        if pdf_bytes is None:
            print(f"Failed to generate {output_name}")
            continue
        output_path = OUTPUT_DIR / f"{output_name}.pdf"
        write_file(output_path, pdf_bytes)
        print(f"Wrote PDF to {output_path}")

    print(f"Test output directory: {OUTPUT_DIR}")
    print("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sample PDFs using native fpdf2 builders.")
    args = parser.parse_args()
    main()
