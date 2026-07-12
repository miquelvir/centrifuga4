#!/usr/bin/env bash
set -euo pipefail

APP_BIN_DIR="${APP_BIN_DIR:-/app/bin}"
mkdir -p "$APP_BIN_DIR"

if [ -x "$APP_BIN_DIR/wkhtmltopdf" ]; then
  exit 0
fi

if command -v wkhtmltopdf >/dev/null 2>&1; then
  cp "$(command -v wkhtmltopdf)" "$APP_BIN_DIR/wkhtmltopdf"
  chmod +x "$APP_BIN_DIR/wkhtmltopdf"
  exit 0
fi

for candidate in /usr/bin/wkhtmltopdf /usr/local/bin/wkhtmltopdf /app/.apt/usr/bin/wkhtmltopdf; do
  if [ -x "$candidate" ]; then
    cp "$candidate" "$APP_BIN_DIR/wkhtmltopdf"
    chmod +x "$APP_BIN_DIR/wkhtmltopdf"
    exit 0
  fi
done

if command -v apt-get >/dev/null 2>&1; then
  apt-get update >/dev/null 2>&1
  mkdir -p /tmp/wkhtmltopdf-install
  cd /tmp/wkhtmltopdf-install
  apt-get download wkhtmltopdf >/dev/null 2>&1 || true
  if [ -f wkhtmltopdf_*.deb ]; then
    dpkg-deb -x wkhtmltopdf_*.deb /tmp/wkhtmltopdf-install/extracted >/dev/null 2>&1 || true
    if [ -x /tmp/wkhtmltopdf-install/extracted/usr/bin/wkhtmltopdf ]; then
      cp /tmp/wkhtmltopdf-install/extracted/usr/bin/wkhtmltopdf "$APP_BIN_DIR/wkhtmltopdf"
      chmod +x "$APP_BIN_DIR/wkhtmltopdf"
      exit 0
    fi
  fi
fi

echo "wkhtmltopdf binary could not be installed" >&2
exit 1
