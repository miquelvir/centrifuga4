import pathlib
from typing import Optional

from fpdf import FPDF


class PDF(FPDF):
    def multi_cell(self, *args, **kwargs):
        if "new_x" not in kwargs:
            kwargs["new_x"] = "LEFT"
        return super().multi_cell(*args, **kwargs)


COMMON_FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
    "/Library/Fonts/DejaVu Sans.ttf",
    str(pathlib.Path.home() / ".local" / "share" / "fonts" / "DejaVuSans.ttf"),
]


def find_unicode_font_path() -> Optional[pathlib.Path]:
    for font_path in COMMON_FONT_PATHS:
        path = pathlib.Path(font_path)
        if path.exists():
            return path
    return None


def create_pdf(font_path: Optional[pathlib.Path] = None) -> FPDF:
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(15, 15, 15)
    pdf.add_page()

    if font_path is not None:
        for style in ["", "B", "I", "BI"]:
            pdf.add_font("DejaVu", style, str(font_path), uni=True)
        pdf.set_font("DejaVu", size=11)
    else:
        pdf.set_font("Helvetica", size=11)

    return pdf


def output_pdf_bytes(pdf: FPDF) -> bytes:
    output = pdf.output(dest="S")
    return output.encode("latin-1") if isinstance(output, str) else output
