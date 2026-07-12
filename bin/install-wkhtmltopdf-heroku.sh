#!/usr/bin/env bash
set -euo pipefail

mkdir -p /app/bin

if [ -x /app/bin/wkhtmltopdf ]; then
  exit 0
fi

if command -v wkhtmltopdf >/dev/null 2>&1; then
  cp "$(command -v wkhtmltopdf)" /app/bin/wkhtmltopdf
  chmod +x /app/bin/wkhtmltopdf
  exit 0
fi

if [ -x /usr/bin/wkhtmltopdf ]; then
  cp /usr/bin/wkhtmltopdf /app/bin/wkhtmltopdf
  chmod +x /app/bin/wkhtmltopdf
  exit 0
fi

if [ -x /usr/local/bin/wkhtmltopdf ]; then
  cp /usr/local/bin/wkhtmltopdf /app/bin/wkhtmltopdf
  chmod +x /app/bin/wkhtmltopdf
  exit 0
fi

if [ -x /app/.apt/usr/bin/wkhtmltopdf ]; then
  cp /app/.apt/usr/bin/wkhtmltopdf /app/bin/wkhtmltopdf
  chmod +x /app/bin/wkhtmltopdf
  exit 0
fi

echo "wkhtmltopdf binary was not installed by the buildpack" >&2
exit 1
