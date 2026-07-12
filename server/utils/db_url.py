import os
import re


def normalize_database_url(url: str | None) -> str | None:
    if not url:
        return None

    normalized = url.strip()
    if not normalized:
        return None

    if normalized.startswith("postgres://"):
        normalized = "postgresql://" + normalized[len("postgres://") :]

    return normalized


def get_database_url() -> str | None:
    return normalize_database_url(
        os.getenv("DATABASE_URL") or os.getenv("MANUAL_DATABASE_URL")
    )
