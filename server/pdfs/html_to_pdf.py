import pathlib
import re
from urllib.parse import urlparse

DEFAULT_IMAGE_ASSETS_FOLDER = pathlib.Path(__file__).resolve().parents[2] / "server" / "blueprints" / "api" / "templates"
_IMAGE_SRC_PATTERN = re.compile(r'src=(?P<quote>["\'])(?P<src>[^"\']+)(?P=quote)')


def html_to_pdf(html_content: str, image_assets_folder=None) -> bytes:
    """Render an HTML string to a PDF binary using fpdf2."""
    if image_assets_folder is None:
        image_assets_folder = DEFAULT_IMAGE_ASSETS_FOLDER
    image_assets_folder = pathlib.Path(image_assets_folder)
    html_content = _rewrite_image_sources(html_content, image_assets_folder)
    html_content = _clean_html_for_fpdf(html_content)

    FPDF, HTMLMixin = _load_fpdf2()

    class PDF(FPDF, HTMLMixin):
        pass

    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(15, 15, 15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    pdf.write_html(html_content)

    output = pdf.output(dest="S")
    return output.encode("latin-1") if isinstance(output, str) else output


def _load_fpdf2():
    try:
        from fpdf import FPDF, HTMLMixin
    except ImportError as exc:
        raise ImportError(
            "fpdf2 is required for HTML to PDF generation. Install it with `pip install fpdf2`."
        ) from exc

    return FPDF, HTMLMixin


def _rewrite_image_sources(html_content: str, image_assets_folder: pathlib.Path) -> str:
    def replace(match):
        src = match.group("src")
        local_src = _resolve_local_image_src(src, image_assets_folder)
        return f'src={match.group("quote")}{local_src}{match.group("quote")}'

    return _IMAGE_SRC_PATTERN.sub(replace, html_content)


def _resolve_local_image_src(src: str, image_assets_folder: pathlib.Path) -> str:
    if src.startswith(("http://", "https://")):
        parsed = urlparse(src)
        local_file = image_assets_folder / pathlib.Path(parsed.path).name
        if local_file.exists():
            return local_file.as_posix()

    return src


def _clean_html_for_fpdf(html_content: str) -> str:
    html_content = _strip_doctype_and_head(html_content)
    html_content = _strip_unsupported_tags(html_content)
    html_content = _normalize_css_lengths(html_content)
    return html_content


def _strip_doctype_and_head(html_content: str) -> str:
    # fpdf2 HTML parser can be confused by full HTML documents with head/meta tags.
    body_match = re.search(r"<body[^>]*>(.*)</body>", html_content, re.S | re.I)
    if body_match:
        return body_match.group(1)

    # If no body tag is present, remove head content and doctype if present.
    html_content = re.sub(r"<!doctype[^>]*>", "", html_content, flags=re.I)
    html_content = re.sub(r"<head[^>]*>.*?</head>", "", html_content, flags=re.S | re.I)
    return html_content


def _strip_unsupported_tags(html_content: str) -> str:
    # Remove form controls and other tags unsupported by fpdf2 HTML parser.
    html_content = re.sub(r"<input\b[^>]*>", "", html_content, flags=re.I)
    return html_content


def _normalize_css_lengths(html_content: str) -> str:
    html_content = re.sub(
        r"(width|height)=([\"'])([0-9]+(?:\.[0-9]+)?)(?:px)\2",
        r"\1=\2\3\2",
        html_content,
        flags=re.I,
    )
    html_content = re.sub(
        r"(width|height):\s*([0-9]+(?:\.[0-9]+)?)px",
        r"\1: \2",
        html_content,
        flags=re.I,
    )
    return html_content
